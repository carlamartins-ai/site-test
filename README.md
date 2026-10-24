# Genial Solutions — site institucional

Site da Genial Solutions em Angular 22 (componentes standalone), com GSAP para animações de scroll e Three.js no showcase de tecnologias da página de Consultoria.

## Requisitos

- Node.js 22 (ou superior)
- npm

## Rodando em desenvolvimento

```bash
npm install
npm start
```

Abra http://localhost:4200. As alterações recarregam automaticamente.

## Build de produção

```bash
npm run build
node serve.mjs
```

O build fica em `dist/angular/browser` e o `serve.mjs` serve o site em http://localhost:3456 (com fallback para as rotas do Angular, como `/consultoria`).

## Estrutura

| Caminho | Conteúdo |
| --- | --- |
| `src/app/site.ts` | Textos, links, e-mail de contato, soluções e tecnologias |
| `src/app/home/` | Página inicial: hero, A Genial, O que nos move, Nossa abordagem, Soluções |
| `src/app/consultoria/` | Página `/consultoria`: hero, Nosso foco, tecnologias com 3D |
| `src/app/shared/` | Menu, rodapé, bloco "Grandes ideias", ícones e animação de entrada |
| `src/styles.scss` | Paleta (preto `#080808`, laranja `#ff7340`), tipografia e botões |
| `public/assets/` | Imagens (foto do hero e ilustrações das soluções) |

Para trocar o link do botão "Conhecer o produto" (Mini Programs), edite `miniProgramsHref` em `src/app/site.ts`.
