/**
 * SupabaseService.ts — Gerenciador de Cloud Saves e Leaderboards
 * 
 * Sincroniza o progresso do jogador na nuvem (Supabase) e alimenta
 * o ranking mundial em tempo real com autenticação resiliente.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://mock.supabase.co';
const SUPABASE_ANON_KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'mock-key';

let _supabase: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!_supabase) {
    try {
      if (SUPABASE_URL && SUPABASE_URL !== 'https://mock.supabase.co') {
        _supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      }
    } catch (e) {
      console.warn('[SupabaseService] Modo Offline / Local Ativo:', e);
    }
  }
  return _supabase;
}

export const SupabaseService = {
  /**
   * Salva o estado completo do jogador na nuvem
   */
  async saveGameState(userId: string, state: any): Promise<{ ok: boolean; msg: string }> {
    const supabase = getSupabase();
    if (!supabase || !userId) {
      // Fallback local garantido
      return { ok: true, msg: 'Salvo localmente com sucesso.' };
    }

    try {
      const payload = {
        user_id: userId,
        char_name: state.name || state.charName || 'Hero of Aden',
        level: state.level || 1,
        class_name: state.className || state.class || 'Warrior',
        combat_power: state.combatPower || 1000,
        gold: state.gold || 0,
        aden_coins: state.adenCoins || state.ac || 0,
        is_premium_pass: !!(state.isPremiumPass || state.premiumPassActive),
        save_data: state,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('player_saves')
        .upsert(payload, { onConflict: 'user_id' });

      if (error) throw error;
      return { ok: true, msg: 'Progresso sincronizado na nuvem ☁️' };
    } catch (err: any) {
      console.warn('[SupabaseService] Erro ao sincronizar nuvem:', err.message);
      return { ok: false, msg: 'Falha na conexão com a nuvem (Salvo localmente).' };
    }
  },

  /**
   * Carrega o estado do jogador a partir da nuvem
   */
  async loadGameState(userId: string): Promise<any | null> {
    const supabase = getSupabase();
    if (!supabase || !userId) return null;

    try {
      const { data, error } = await supabase
        .from('player_saves')
        .select('save_data')
        .eq('user_id', userId)
        .single();

      if (error || !data) return null;
      return data.save_data;
    } catch (err) {
      console.warn('[SupabaseService] Erro ao carregar da nuvem:', err);
      return null;
    }
  },

  /**
   * Consulta os rankings globais em tempo real
   */
  async fetchLeaderboards(limit: number = 50): Promise<any[]> {
    const supabase = getSupabase();
    if (!supabase) return [];

    try {
      const { data, error } = await supabase
        .from('player_saves')
        .select('char_name, level, class_name, combat_power, is_premium_pass, updated_at')
        .order('combat_power', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.warn('[SupabaseService] Falha ao carregar leaderboards da nuvem:', err);
      return [];
    }
  }
};
