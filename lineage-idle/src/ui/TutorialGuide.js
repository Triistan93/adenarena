/**
 * TutorialGuide.js — Guia e Tutorial para Jogadores Iniciantes
 *
 * Exibe automaticamente uma tela explicativa interativa na PRIMEIRA VEZ que o jogador abre qualquer aba.
 * Mantém um botão permanente ("❓ Guia da Aba") no canto de cada painel para tirar dúvidas a qualquer momento.
 */

export const GUIDES_DATA = {
  zones: {
    id: 'zones',
    title: '⚔️ Zonas de Caça & Combate Automático',
    subtitle: 'Aprenda como evoluir seu personagem e gerenciar suas caçadas em Lineage II Idle.',
    icon: '⚔️',
    color: '#e8c39a',
    sections: [
      {
        heading: '🎯 Escolha da Zona de Caça',
        text: 'Navegue pelo mapa ou lista de zonas. Cada área possui um requisito de Nível Recomendado. Enfrentar monstros de nível muito alto reduz sua precisão e aumenta o dano recebido.',
        tip: 'Dica: Zonas marcadas em verde garantem taxa máxima de XP sem risco de morte!'
      },
      {
        heading: '🧪 Auto-Poções & Soulshots',
        text: 'No topo da tela de combate, ative Poções Automáticas de HP/MP e Soulshots/Spiritshots. Soulshots dobram seu P.Atk e Spiritshots dobram seu M.Atk em cada golpe.',
        tip: 'Mantenha seus shots ativos durante lutas contra Chefes e Raids para máximo dano!'
      },
      {
        heading: '🎁 Drops de Caça & Streak',
        text: 'Ao derrotar monstros, você ganha XP, SP, Adena e pode dropar consumíveis, materiais e equipamentos raros. Matar vários monstros em sequência ativa o Bônus de Streak!',
        tip: 'Equipamentos têm taxa de drop rara (0.3% a 0.6%). Monstros Elites e Chefes têm taxas multiplicadas!'
      }
    ]
  },

  character: {
    id: 'character',
    title: '👤 Personagem, Atributos & Subclasses',
    subtitle: 'Entenda como funcionam os atributos primários, dyes de tatuagem e o sistema de subclasses.',
    icon: '👤',
    color: '#ffd877',
    sections: [
      {
        heading: '📊 Atributos Primários (Dyes & Stats L2)',
        text: '• **STR**: Aumenta o Ataque Físico (P.Atk).\n• **DEX**: Aumenta Chance Crítica, Velocidade de Ataque e Esquiva.\n• **CON**: Aumenta HP Máximo e Defesa Física.\n• **INT**: Aumenta o Ataque Mágico (M.Atk).\n• **WIT**: Aumenta Velocidade de Cast e Chance Crítica Mágica.\n• **MEN**: Aumenta MP Máximo e Defesa Mágica.',
        tip: 'Você pode usar Tatuagens (Dyes) na Forja para transferir até +5 pontos em um atributo!'
      },
      {
        heading: '🛡️ Subclasses (Nível 75+)',
        text: 'Ao atingir o Nível 75 com sua classe principal, você pode desbloquear até 3 Subclasses. Cada Subclasse concederá **Certificados de Habilidade** que acumulam bônus na sua classe principal!',
        tip: 'Alterne livremente entre subclasses sem perder o progresso de nenhuma delas.'
      }
    ]
  },

  inventory: {
    id: 'inventory',
    title: '🎒 Inventário, Filtros & Sistema de Compound',
    subtitle: 'Gerencie seus equipamentos, poções e fusões de itens.',
    icon: '🎒',
    color: '#a855f7',
    sections: [
      {
        heading: '🗡️ Equipamentos & Graus (Grades)',
        text: 'Os itens são divididos em Graus pelo seu Nível:\n• **No-Grade**: Nível 1 ao 19\n• **D-Grade**: Nível 20 ao 39\n• **C-Grade**: Nível 40 ao 51\n• **B-Grade**: Nível 52 ao 61\n• **A-Grade**: Nível 62 ao 75\n• **S-Grade / Frost Lord**: Nível 76 ao 85+',
        tip: 'Equipe sempre o melhor Grau compatível com seu nível atual para ter bônus de Set!'
      },
      {
        heading: '🧪 Sistema de Compound (Fusão)',
        text: 'Clique no botão **🧪 COMPOUND** no topo do inventário para fundir 2 equipamentos idênticos do mesmo nível. Em caso de sucesso, o item evolui de nível (Lv.1 ➔ Lv.2) e ganha **+15% de bônus de atributos por nível**.',
        tip: 'Em caso de falha no Compound, o item principal permanece seguro e apenas o ingrediente é consumido!'
      },
      {
        heading: '🧹 Auto-Venda & Desmontar',
        text: 'Utilize os botões de seleção no rodapé para marcar itens Comuns e Incomuns em lote para Vender ou Desmontar em materiais de criação.',
        tip: 'Ative a Auto-Venda no topo para vender automaticamente equipamentos comuns obtidos na caça.'
      }
    ]
  },

  warehouse: {
    id: 'warehouse',
    title: '📦 Baú do Banco & Armazenamento',
    subtitle: 'Guarde seus tesouros e transfira itens entre suas subclasses.',
    icon: '📦',
    color: '#caa06a',
    sections: [
      {
        heading: '🔒 Armazenamento Seguro',
        text: 'Deposite Adena e itens valiosos no seu Baú Pessoal. O baú é compartilhado entre todas as suas subclasses do personagem.',
        tip: 'Use o botão "Depositar Materiais" para enviar rapidamente todos os insumos de criação ao banco.'
      }
    ]
  },

  skills: {
    id: 'skills',
    title: '⚡ Habilidades, Cargas & Almas Kamael',
    subtitle: 'Domine suas habilidades ativas, passivas, cargas e almas de combate.',
    icon: '⚡',
    color: '#38bdf8',
    sections: [
      {
        heading: '📖 Árvore de Habilidades',
        text: 'Gaste seus Pontos de Habilidade (SP) para aprender e evoluir habilidades ativas e passivas da sua classe. Habilidades passivas concedem bônus permanentes.',
        tip: 'Habilidades de dano utilizam a fórmula oficial de dano físico do Lineage 2 (Multiplicador de constante 77/70).'
      },
      {
        heading: '⚡ Cargas de Habilidade (Charge Lv. 1-8)',
        text: 'Classes de combate acumulam Cargas de Habilidade durante o ataque. Cada nível de Carga aumenta o dano da sua próxima habilidade em **+20%** (até o limite de Carga Nível 8).',
        tip: 'Acumule 8 cargas antes de soltar sua habilidade mais forte para causar um dano devastador!'
      },
      {
        heading: '👻 Almas Kamael (1-5 Almas)',
        text: 'Personagens Kamael absorvem almas dos monstros derrotados. Cada alma acumulada concede **+5% de Dano de Skill** adicional.',
        tip: 'Almas Kamael podem ser consumidas para ativar habilidades especiais e transformações!'
      }
    ]
  },

  shop: {
    id: 'shop',
    title: '🛍️ Mercador & Mercado da Cidade',
    subtitle: 'Compre poções, soulshots, insumos de criação e joias.',
    icon: '🛍️',
    color: '#facc15',
    sections: [
      {
        heading: '🧪 Consumíveis de Sobrevivência',
        text: 'Abasteça seu estoque de Poções de HP (P, M, G, XL), Poções de MP e Soulshots/Spiritshots. O abastecimento garante que seu auto-combate não seja interrompido.',
        tip: 'Poções de tamanho XL restauram uma grande quantidade de HP de forma instantânea durante Raids!'
      },
      {
        heading: '🔮 Mercado Místico Rotativo',
        text: 'O Mercado Místico atualiza ofertas especiais contendo Joias de Boss e materiais raros em intervalos de tempo.',
        tip: 'Fique atento aos estoques limitados do Mercado Místico para adquirir fragmentos de joias épicas!'
      }
    ]
  },

  craft: {
    id: 'craft',
    title: '⚒️ Forja Imperial & Criação Universal',
    subtitle: 'Explore todas as subabas da Forja: Crafting, Soul Crystals, Pushkin MW, Dyes, Elementos, Cintos e Life Stones.',
    icon: '⚒️',
    color: '#f59e0b',
    sections: [
      {
        heading: '⚒️ Crafting de Equipamentos',
        text: 'Crie armas, armaduras, capas, cintos e joias utilizando matérias-primas como Iron Ore, Oriharukon, Adamantite e Leather.',
        tip: 'Subir seu Nível de Forja desbloqueia receitas de Graus mais elevados (Grade A e S).'
      },
      {
        heading: '🔮 Soul Crystals (SA)',
        text: 'Forje e engaste Soul Crystals (Red, Green, Blue) em armas para liberar Special Abilities (SA) como Health (+25% HP), Focus (+80 Crit) ou Acumen (+15% Cast).',
        tip: 'Você pode fundir 2 Soul Crystals do mesmo nível para subir seu grau.'
      },
      {
        heading: '✨ Mestre Pushkin MW (Masterwork)',
        text: 'Leve equipamentos comuns ao Mestre Pushkin para forjar a versão **Masterwork (MW)**, garantindo bônus adicionais de status e aura cintilante.',
        tip: 'Itens Masterwork possuem multiplicadores superiores aos itens base!'
      },
      {
        heading: '🔥 Atributos Elementais (+300 Element)',
        text: 'Incuta Pedras Elementais (*Fogo, Água, Terra, Vento, Escuridão, Sagrado*) em Armas e Peitorais. Garante até +70% de dano extra PvE contra monstros vulneráveis.',
        tip: 'O primeiro engaste concede +20 de Atributo e engastes seguintes concedem +5.'
      },
      {
        heading: '🎗️ Síntese de Cintos [S]',
        text: 'Sintetize o lendário **Blessed Top-Grade Magic Ornament Belt [S]** com 70% de chance de sucesso por 500k Adena. Concede **+7.2% Defesa PvE** e **+6% Dano**.',
        tip: 'O cinto abençoado é uma das melhores peças defensivas do jogo!'
      },
      {
        heading: '💎 Augmentation / Life Stones',
        text: 'Utilize Superior Life Stones em Armas e Joias Épicas (*Queen Ant, Baium, Valakas, Zaken, Antharas*) para liberar Item Skills passivas (Might, Empower, Shield, Focus, Celestial).',
        tip: 'A habilidade Celestial Shield concede 7 segundos de invencibilidade completa!'
      }
    ]
  },

  alchemy: {
    id: 'alchemy',
    title: '🧪 Laboratório de Alquimia',
    subtitle: 'Destile Elixires de Atributos e reagentes mágicos.',
    icon: '🧪',
    color: '#10b981',
    sections: [
      {
        heading: '🍷 Elixires de Status Permanentes',
        text: 'Combine essências e cristais para criar Elixires de STR, DEX, CON, INT, WIT e MEN. Cada elixir consumido aumenta permanentemente o atributo base do seu personagem.',
        tip: 'Há um limite de elixires por nível. Elabore primeiro os atributos focados na sua classe principal!'
      }
    ]
  },

  astral: {
    id: 'astral',
    title: '✨ Maestria Astral & Constelações',
    subtitle: 'Canalize o poder das estrelas nas Constelações do Dragão e da Fênix.',
    icon: '✨',
    color: '#ec4899',
    sections: [
      {
        heading: '🐉 Constelação do Dragão (Ofensiva)',
        text: 'Gaste Fragmentos Astrais para evoluir nós de Fúria Titânica (+P.Atk), Chama Arcana (+M.Atk), Golpe Mortal (+Crit Chance) e Lâmina Suprema (+Crit Dmg).',
        tip: 'Foque na Constelação do Dragão se quiser acelerar o tempo de caça dos monstros!'
      },
      {
        heading: '🦅 Constelação da Fênix (Defensiva)',
        text: 'Evolua Sangue da Fênix (+HP%), Mente Iluminada (+MP%), Éter Sagrado (+Regen MP) e Escudo Divino (+P.Def/M.Def).',
        tip: 'Essencial para resistir aos golpes dos Raid Bosses mais poderosos.'
      }
    ]
  },

  expeditions: {
    id: 'expeditions',
    title: '🏰 Expedições, Manor & Castelos de Aden',
    subtitle: 'Plante sementes no Manor, conquiste Castelos e envie Expedições de Mercenários.',
    icon: '🏰',
    color: '#8b5cf6',
    sections: [
      {
        heading: '🌱 Sistema de Manor (Sementes & Colheita)',
        text: 'Compre Sementes do Manor, plante em zonas de caça e colha frutos ao derrotar monstros. Troque sua colheita na cidade por materiais raros de criação.',
        tip: 'O Manor é uma das formas mais baratas de conseguir minérios e tecidos raros!'
      },
      {
        heading: '👑 Castelos (Gludio, Giran, Aden)',
        text: 'Desafie os guardiões dos Castelos de Gludio, Giran e Aden. Conquistar um castelo garante **Impostos Diários em Adena** coletados de todo o servidor!',
        tip: 'Colete seus impostos diariamente no painel do Castelo!'
      },
      {
        heading: '⛵ Expedições de Mercenários',
        text: 'Envie esquadrões de mercenários em missões temporizadas (1h, 4h, 8h). Eles retornarão com caixas de suprimentos, receitas e Adena.',
        tip: 'Mantenha suas expedições sempre rodando em segundo plano!'
      }
    ]
  },

  codex: {
    id: 'codex',
    title: '📜 Codex & Coleção de Itens',
    subtitle: 'Complete coleções de equipamentos e Boss Dolls para desbloquear bônus na conta.',
    icon: '📜',
    color: '#34d399',
    sections: [
      {
        heading: '📚 Coleções de Equipamentos',
        text: 'Ao obter equipamentos e joias repetidas, registre-os no Codex. Completar um conjunto de coleção concede bônus permanentes como +P.Atk, +M.Atk, +HP ou +Def.',
        tip: 'Mesmo itens de No-Grade concedem bônus valiosos quando a coleção é completada!'
      }
    ]
  },

  dolls: {
    id: 'dolls',
    title: '🎎 Boss Dolls & Sintetizador',
    subtitle: 'Equipe colecionáveis de chefes lendários e faça fusões.',
    icon: '🎎',
    color: '#f43f5e',
    sections: [
      {
        heading: '👑 Boss Dolls (Queen Ant, Baium, Zaken, Antharas)',
        text: 'Dolls de Chefes concedem bônus massivos de atributos atipicamente altos. Você pode equipar Dolls no seu inventário.',
        tip: 'Dolls de grau elevado concedem redução de dano e vampirismo de vida!'
      },
      {
        heading: '🔮 Sintetizador de Dolls',
        text: 'Combine 3 Dolls idênticas do mesmo grau no Sintetizador para tentar evoluir para o próximo nível de raridade.',
        tip: 'Em caso de sucesso, a Doll ganha efeitos visuais brilhantes e atributos duplicados.'
      }
    ]
  },

  quests: {
    id: 'quests',
    title: '📜 Missões, Bounties & Passe de Batalha',
    subtitle: 'Cumpra objetivos diários para ganhar Adena, SP e itens exclusivos.',
    icon: '📜',
    color: '#fbbf24',
    sections: [
      {
        heading: '🎯 Missões Diárias & Caçadas',
        text: 'Derrote uma quantidade estipulada de monstros ou chefes diariamente para resgatar baús de suprimentos e cupons de teleporte.',
        tip: 'Reivindique todas as recompensas diárias antes do reset da meia-noite!'
      },
      {
        heading: '🎫 Passe de Batalha (Adena Pass)',
        text: 'Acumule pontos de passe ao jogar para subir de nível no Passe. Desbloqueie recompensas gratuitas e aprimore para o Passe Premium para prêmios lendários.',
        tip: 'O Passe Premium concede pergaminhos de enchant abençoados!'
      }
    ]
  },

  tower: {
    id: 'tower',
    title: '🏰 Torre da Insolência (Tower of Insolence)',
    subtitle: 'Desafie os 100 andares da torre e varra recompensas diárias.',
    icon: '🏰',
    color: '#c084fc',
    sections: [
      {
        heading: '🧗 Escalada dos 100 Andares',
        text: 'Enfrente guardiões e chefes em andares progressivamente mais difíceis. Cada andar superado concede recompensas únicas e desbloqueia o Sweep Diário.',
        tip: 'Se falhar em um andar, fortaleça seus equipamentos na Forja antes de tentar novamente!'
      },
      {
        heading: '🧹 Varredura Diária (Sweep)',
        text: 'Uma vez por dia, utilize o botão "Varredura Diária" para coletar instantaneamente as recompensas de todos os andares já superados!',
        tip: 'Quanto mais alto você subir na torre, maior será a quantidade diária de Adena e SP coletada!'
      }
    ]
  }
};

// Aliases: mapeia chaves de abas alternativas para as chaves primárias de guia
// O guia de 'craft' está definido como 'craft' (não 'forge')
GUIDES_DATA['forge'] = GUIDES_DATA['craft'];       // forge → craft
GUIDES_DATA['equipment'] = GUIDES_DATA['inventory']; // equipment → inventory

// Tabela de resolução de chaves (tab-name → guide-key)
const TAB_TO_GUIDE = {};
Object.keys(GUIDES_DATA).forEach(k => { TAB_TO_GUIDE[k] = k; });

function getShadowRoot() {
  return document.getElementById('idle-host')?.shadowRoot || document;
}

/**
 * Verifica se a aba já foi vista. Se for a 1ª vez, abre o modal de tutorial automaticamente.
 */
export function checkTabGuide(tabKey, state, saveStateFn) {
  if (!tabKey || tabKey === 'close') return;
  const guideKey = TAB_TO_GUIDE[tabKey];
  if (!guideKey || !GUIDES_DATA[guideKey]) return;

  // Atualiza/injeta o botão flutuante de ajuda na aba ativa
  try { renderPersistentHelpButton(tabKey, guideKey); } catch(_) {}

  if (!state) return;
  if (!state.seenGuides) state.seenGuides = {};

  if (!state.seenGuides[guideKey]) {
    state.seenGuides[guideKey] = true;
    if (typeof saveStateFn === 'function') saveStateFn();
    // Pequeno delay para permitir o DOM atualizar antes do modal
    setTimeout(() => openTabGuideModal(guideKey), 150);
  }
}

/**
 * Abre a janela Modal com o Guia da Aba informada
 */
export function openTabGuideModal(guideKey) {
  const data = GUIDES_DATA[guideKey] || GUIDES_DATA.zones;
  if (!data) return;

  const root = getShadowRoot();
  let overlay = root.querySelector('#tutorial-guide-modal');

  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'tutorial-guide-modal';
    overlay.className = 'modal-overlay active';
    overlay.style.cssText = `
      position: fixed; inset: 0; background: rgba(0, 0, 0, 0.85);
      z-index: 999999; display: flex; align-items: center; justify-content: center;
      padding: 16px; backdrop-filter: blur(4px); animation: fadeIn 0.2s ease-out;
    `;
    if (root.body) root.body.appendChild(overlay);
    else root.appendChild(overlay);
  }

  const sectionsHtml = data.sections.map(s => `
    <div style="background: rgba(18, 22, 34, 0.9); border: 1px solid rgba(212, 167, 68, 0.3); border-radius: 10px; padding: 14px; margin-bottom: 12px;">
      <h4 style="margin: 0 0 6px 0; font-family: 'Cinzel', serif; color: ${data.color || '#f4d58a'}; font-size: 15px; display: flex; align-items: center; gap: 6px;">
        ${s.heading}
      </h4>
      <p style="margin: 0; font-size: 12px; color: #ddd; line-height: 1.6; whitespace: pre-line;">
        ${s.text.replace(/\n/g, '<br/>')}
      </p>
      ${s.tip ? `
        <div style="margin-top: 8px; font-size: 11px; color: #34d399; background: rgba(52, 211, 153, 0.1); border-left: 3px solid #34d399; padding: 6px 10px; border-radius: 0 6px 6px 0;">
          💡 <strong>Dica Estratégica:</strong> ${s.tip}
        </div>
      ` : ''}
    </div>
  `).join('');

  overlay.innerHTML = `
    <div style="background: linear-gradient(180deg, rgba(20, 24, 36, 0.98), rgba(10, 12, 18, 0.98)); border: 1px solid rgba(212, 167, 68, 0.6); border-radius: 14px; max-width: 580px; width: 100%; max-height: 85vh; display: flex; flex-direction: column; color: #fff; font-family: sans-serif; box-shadow: 0 10px 40px rgba(0,0,0,0.9);">
      
      <!-- Header -->
      <div style="padding: 16px 20px; border-bottom: 1px solid rgba(212, 167, 68, 0.3); display: flex; justify-content: space-between; align-items: center; background: rgba(0, 0, 0, 0.3); border-radius: 14px 14px 0 0;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <span style="font-size: 24px; filter: drop-shadow(0 0 6px ${data.color});">${data.icon}</span>
          <div>
            <h3 style="margin: 0; font-family: 'Cinzel', serif; color: #f4d58a; font-size: 18px; font-weight: bold;">
              ${data.title}
            </h3>
            <div style="font-size: 11px; color: #aaa; margin-top: 2px;">
              ${data.subtitle}
            </div>
          </div>
        </div>
        <button onclick="window.closeTabGuideModal()" style="background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.2); color: #ccc; font-size: 16px; border-radius: 50%; width: 32px; height: 32px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s;">✕</button>
      </div>

      <!-- Body Content -->
      <div style="padding: 16px 20px; overflow-y: auto; flex: 1;">
        ${sectionsHtml}
      </div>

      <!-- Footer -->
      <div style="padding: 12px 20px; border-top: 1px solid rgba(212, 167, 68, 0.2); background: rgba(0, 0, 0, 0.4); border-radius: 0 0 14px 14px; display: flex; justify-content: space-between; align-items: center;">
        <span style="font-size: 11px; color: #888;">
          ❓ Você pode reabrir este guia a qualquer momento no botão <strong>Guia da Aba</strong>.
        </span>
        <button onclick="window.closeTabGuideModal()" style="padding: 8px 20px; font-family: 'Cinzel', serif; font-weight: bold; font-size: 12px; background: linear-gradient(180deg, #d4a744, #8a641c); border: 1px solid #ffe699; color: #000; border-radius: 6px; cursor: pointer; box-shadow: 0 2px 10px rgba(212, 167, 68, 0.3);">
          ENTENDI, CONTINUAR JOGO!
        </button>
      </div>
    </div>
  `;

  overlay.style.display = 'flex';
}

/**
 * Fecha o modal de tutorial
 */
export function closeTabGuideModal() {
  const root = getShadowRoot();
  const overlay = root.querySelector('#tutorial-guide-modal');
  if (overlay) overlay.style.display = 'none';
}

/**
 * Renderiza/atualiza o botão flutuante "❓ Guia da Aba" no canto do painel ativo.
 * @param {string} tabKey - chave da aba (ex: 'craft')
 * @param {string} [resolvedGuideKey] - chave resolvida do guia (ex: 'craft'); usa tabKey se omitido
 */
export function renderPersistentHelpButton(tabKey, resolvedGuideKey) {
  const guideKey = resolvedGuideKey || tabKey;
  if (!guideKey || !GUIDES_DATA[guideKey]) return;

  if (typeof window !== 'undefined') {
    window._currentActiveGuideKey = guideKey;
    window.openCurrentTabGuide = () => openTabGuideModal(window._currentActiveGuideKey || guideKey);
  }

  const root = getShadowRoot();

  // Clean up any legacy position:absolute help buttons inside tab panes
  root.querySelectorAll('.tab-help-btn').forEach(b => b.remove());

  const topGuideBtn = root.querySelector('#top-bar-guide-btn') || document.getElementById('top-bar-guide-btn');
  if (topGuideBtn) {
    const guideData = GUIDES_DATA[guideKey];
    topGuideBtn.style.display = 'inline-flex';
    topGuideBtn.title = `Guia: ${guideData?.title || tabKey}`;
    topGuideBtn.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      openTabGuideModal(guideKey);
    };
  }
}
