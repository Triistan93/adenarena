# Animações do protótipo — 04/10/2026

Sprites 2,5D gerados com o ImageGen integrado, usando as artes existentes do Idle como referência. Nenhuma arte original foi substituída.

## Direção e prompts

Prompt comum: fundo transparente; grade de quatro colunas por três linhas; doze poses completas, identidade e proporções constantes, vista em três quartos voltada para a direita; oito poses de caminhada alternando pernas e quatro poses de ataque (preparação, antecipação, golpe, recuperação). Sem textos, grade desenhada, cenário ou efeitos sobrepostos. Manter arma, pés e acessórios inteiros com margem.

- Guerreiro: referência `m_human_warrior.webp`; armadura metálica, tecido azul e alabarda; ataque com levantamento e golpe frontal.
- Arqueiro: referência `m_elf_silver_ranger.webp`; cabelo prateado, armadura prata/azul; arco em repouso, puxada da corda, disparo e recuperação.
- Feiticeiro: referência `m_darkelf_dark_elf_mage.webp`; pele lavanda, cabelos brancos, vestes violetas e cajado de cristal; canalização e conjuração frontal.

Os JSONs registram a origem e as caixas das poses. `scripts/normalize-action-animation.mjs` separa silhuetas conectadas e alinha os pés com escala constante. Cada atlas final tem 1536 × 864 pixels, com células 384 × 288, âncora horizontal 156 e base 276. Quadros 0–7: caminhada a 12 fps. Quadros 8–11: ataque a cada 90 ms; dano/projétil liberado aos 180 ms.

## Limites atuais

Não são modelos 3D com esqueleto. São sprites com poses próprias e espelhamento horizontal; ainda não há vistas de costas ou oito direções. Os inimigos usam retratos existentes com antecipação, reação a impacto e desaparecimento, sem ciclos de caminhada próprios. As animações geradas ainda podem apresentar pequenas variações entre quadros.

Backup anterior às alterações: `backups/hybrid-animation-20261004/`. Integração restrita ao modo de protótipo isolado.
