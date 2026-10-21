# PRODUCT.md — Portfólio Wesley Melo

## O que é
Site pessoal de uma página que apresenta a trajetória de Wesley Melo na área de helpdesk, sistemas e automação, com um estudo de caso técnico em página separada (`certificados.html`).

## Para quem
- **Empregadores de suporte/infra**: querem saber o que ele já faz e se resolve problema de verdade.
- **Pessoas que precisam automatizar um processo**: procuram alguém que entenda dados, regras e integração.
- **Leitores de portfolio técnico**: avaliam qualidade de raciocínio, não só resultado final.

## Superfícies
| Página | Papel |
|---|---|
| `index.html` | Portfólio (Sobre, Habilidades, Projetos, Contato) |
| `certificados.html` | Estudo de caso do fluxo n8n de certificados Pix |

## Voz
Português do Brasil, direto e sem adjectives de sobra. Fala de método antes de falar de resultado. Assume leitor técnico: pode usar nome de ferramenta (n8n, Evolution API) sem explicar o básico.

## Idiomas
Site bilíngue: português (padrão) e inglês. A escolha do visitante fica salva no navegador e vale para as duas páginas. Termos técnicos não são traduzidos.

## Tema
O site abre sempre no modo escuro, nas duas páginas. O visitante pode alternar para claro durante a visita, mas a próxima entrada começa de novo no escuro.

## Regras de conteúdo
- Nada de dado real: empresas, sistemas, clientes e credenciais aparecem sempre como fictícios.
- Nível de habilidade é autoavaliação honesta, com rótulo (`Base sólida`, `Praticando`, `Estudando`) e não número inventado.
- GitHub e LinkedIn com link real apenas quando o perfil existir; caso contrário, "Perfil em breve" com `aria-disabled`.
- Sem promessa de resultado e sem métrica sem fonte.

## Restrições técnicas
- Site estático: sem Node, sem build, sem npm. Um `index.html` por página, CSS inline, React 18 + Babel via CDN onde há interatividade.
- Sem cor decorativa: preto, branco e um verde de status usado só como sinal.
- Sem dados reais, sem rastreamento, sem cookies além do tema salvo em `localStorage`.
