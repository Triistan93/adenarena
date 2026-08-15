/**
 * ComposioService.js — Módulo de Integração com o SDK Oficial do Composio (@composio/core)
 *
 * Permite criar sessões para jogadores/administradores, autenticar integrações (GitHub, Discord, Slack, etc.)
 * e executar chamadas de ferramentas seguras no backend/servidor.
 */

import { Composio } from '@composio/core';

let _composioClient = null;

/**
 * Obtém ou inicializa a instância do cliente Composio.
 * @param {string} [apiKey]
 * @returns {Composio}
 */
export function getComposioClient(apiKey = null) {
  if (!_composioClient) {
    const key = apiKey || (typeof process !== 'undefined' ? process.env.COMPOSIO_API_KEY : null) || (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_COMPOSIO_API_KEY : null);
    _composioClient = new Composio({ apiKey: key });
  }
  return _composioClient;
}

/**
 * Cria ou recupera uma sessão de ferramentas para um usuário/jogador específico.
 * @param {string} userId — Identificador único e estável (ex: 'admin_adenarena', 'player_123')
 * @returns {Promise<ToolRouterSession>}
 */
export async function createComposioSession(userId = 'admin_adenarena') {
  const composio = getComposioClient();
  return await composio.create(userId);
}

/**
 * Gera um link de conexão seguro (Connect Link) para autorizar um aplicativo.
 * @param {string} userId — Identificador do usuário
 * @param {string} toolkitSlug — Nome do toolkit (ex: 'github', 'discord', 'slack', 'notion')
 * @returns {Promise<{ redirectUrl: string, id: string, status: string }>}
 */
export async function getConnectLink(userId, toolkitSlug) {
  const session = await createComposioSession(userId);
  return await session.authorize(toolkitSlug);
}

/**
 * Executa uma ferramenta com os parâmetros fornecidos.
 * @param {string} userId — Identificador do usuário
 * @param {string} toolSlug — Nome exato da ferramenta (ex: 'COMPOSIO_SEARCH_TOOLS', 'GITHUB_GET_A_REPOSITORY')
 * @param {Object} params — Argumentos de entrada da ferramenta
 * @returns {Promise<Object>}
 */
export async function executeComposioTool(userId, toolSlug, params = {}) {
  const session = await createComposioSession(userId);
  return await session.execute(toolSlug, params);
}
