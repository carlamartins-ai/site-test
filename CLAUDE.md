# CLAUDE.md — Padrões de engenharia Angular 22

## 1. Contexto e objetivo

- Projeto: site institucional agora, com possibilidade de evolução para uma plataforma web com áreas autenticadas e funcionalidades de negócio.
- Stack principal: Angular **22**, TypeScript estrito e Angular Router.
- Objetivo: código correto, legível, seguro, acessível, testável, escalável e simples de manter.
- Idioma da comunicação e das explicações: **português do Brasil**. Nomes de arquivos, classes, variáveis, funções e APIs: **inglês**, salvo termos de negócio que precisem manter sua nomenclatura.
- Atue como engenheiro de software sênior e mentor Angular. Não apenas implemente: explique brevemente decisões técnicas relevantes e alternativas rejeitadas.
- Antes de codificar, confira as versões reais em `package.json`, configurações e padrões existentes. Não invente APIs, scripts, dependências ou caminhos.
- Se houver diferença entre estas regras e APIs disponíveis na versão instalada, consulte a documentação oficial correspondente e explique o ajuste.

## 2. Princípios inegociáveis

- Priorize **simplicidade, coesão, baixo acoplamento, alta testabilidade e consistência**.
- Aplique Clean Code, SOLID, DRY, KISS e YAGNI com pragmatismo; não crie abstrações sem uma necessidade concreta.
- Uma funcionalidade deve ter responsabilidades e fronteiras bem definidas.
- Não concentre apresentação, estado, regras de negócio e HTTP no mesmo componente.
- Não repita código relevante; extraia apenas quando existir reutilização real ou uma fronteira conceitual clara.
- Prefira composição a herança. Use injeção de dependências para abstrações que tenham utilidade.
- Não introduza frameworks adicionais, gerenciadores globais de estado ou padrões enterprise sem justificar o custo.
- Respeite o estilo existente ao alterar arquivos; proponha migrações separadas em vez de refatorações amplas e incidentais.

## 3. Arquitetura: feature-first + standalone

- Organize **por domínio/funcionalidade**, não por pastas globais gigantes de `components/`, `services/` e `models/`.
- Em Angular 22, use componentes, diretivas e pipes **standalone**; não crie `NgModules` para organizar novas funcionalidades.
- Não declare `standalone: true`: já é o padrão.
- Use `app.routes.ts` e arquivos `*.routes.ts` próprios de cada feature, aplicando `loadChildren` e/ou `loadComponent` quando adequado.
- Separe páginas públicas, layouts compartilhados e, futuramente, áreas autenticadas.
- Uma feature não deve importar detalhes internos de outra feature. Compartilhe contratos mínimos ou extraia algo genuinamente reutilizável.
- `core/`: infraestrutura transversal e de escopo da aplicação (configuração, autenticação, interceptors, tratamento global de erros), apenas quando necessária.
- `shared/`: elementos reutilizáveis e sem regras de negócio específicas (UI, pipes e utilitários realmente genéricos).
- `features/`: capacidades do produto, incluindo suas páginas, componentes privados, estado, serviços de acesso a dados e modelos pertinentes.
- `layouts/`: cascas visuais públicas e autenticadas, quando ambas existirem.
- Use `data-access/`, `domain/` e `ui/` **dentro de uma feature somente quando a complexidade justificar**. Não crie camadas vazias.
- Não adote micro-frontends, Nx, bibliotecas publicadas ou múltiplos apps agora apenas por expectativa de crescimento.

### Estrutura de referência (adapte à realidade; não crie diretórios vazios)

```text
src/
  app/
    app.config.ts
    app.routes.ts
    core/
      config/
      http/
      auth/                  # somente quando houver autenticação
    shared/
      ui/
      utils/
    layouts/
      public-layout/
      app-layout/            # somente quando a plataforma existir
    features/
      home/
        home.ts
        home.html
        home.css
      consulting/
        consulting.routes.ts
        pages/
      contact/
        contact.routes.ts
        pages/
      platform/              # não implementar antecipadamente
        platform.routes.ts
        billing/
        payments/
        notifications/
  styles/                    # tokens e estilos globais, se necessários
  main.ts
```

- O exemplo é ilustrativo, não uma ordem de criar módulos futuros.
- Se o site e a plataforma adquirirem **ciclos de deploy, domínios, autenticação ou exigências operacionais diferentes**, proponha separar em dois apps de um Angular workspace, com bibliotecas compartilhadas apenas se houver reutilização concreta.

## 4. Angular 22: APIs e padrões atuais

- Use Signals: `signal()` para estado local, `computed()` para valores derivados e `linkedSignal()` quando houver estado derivado editável com dependências reativas.
- Use `input()`, `output()` e `model()` quando apropriado, em vez dos decorators legados para componentes novos.
- Use `inject()` para DI. Para novos serviços singleton de escopo global, prefira `@Service()` (Angular 22); mantenha `@Injectable` quando o escopo ou a compatibilidade exigir.
- Angular 22 usa **OnPush** e **zoneless** por padrão: não adicione configurações redundantes e não dependa de Zone.js para atualizar a UI.
- Templates: prefira `@if`, `@for` (com `track` estável) e `@switch`; use `@defer` para partes pesadas ou secundárias quando fizer sentido.
- Prefira `[class.foo]` e `[style.prop]` a `ngClass`/`ngStyle`; importe somente as diretivas/pipes utilizados.
- Mantenha templates simples: lógica de negócio e transformações complexas ficam no TypeScript, não no HTML.
- Use `effect()` somente para sincronizar com sistemas externos; não para recalcular estado que poderia ser `computed()`.
- Não crie subscriptions manuais desnecessárias. Para Observables em componentes, prefira `async` pipe, `toSignal()` ou `takeUntilDestroyed()` conforme o caso.
- Evite manipulação direta do DOM. Para interatividade, use bindings e APIs suportadas pelo Angular.
- Use as APIs efetivamente estáveis no Angular 22; não copie soluções antigas de Angular 12–19 sem necessidade.

## 5. Separação de responsabilidades e fluxo de dados

- **Componente/página**: apresentação, acessibilidade, eventos e orquestração simples de UI.
- **Estado da feature**: estado compartilhado ou complexo da funcionalidade. Use Signals em um serviço/store local quando necessário.
- **Serviço de acesso a dados**: HTTP, endpoints, mapeamento de DTOs e tratamento técnico de comunicação.
- **Domínio**: modelos e regras de negócio puras. Não dependem de templates ou detalhes de infraestrutura quando puderem ser isolados.
- Fluxo preferido: `page/component -> feature state ou use case (se necessário) -> data-access -> API`.
- Regras simples não exigem classes `UseCase`, `Repository` ou interfaces artificiais. Introduza-as quando trouxerem isolamento ou testabilidade reais.
- Evite serviços globais com dezenas de responsabilidades e dependências circulares.

## 6. TypeScript, nomenclatura e legibilidade

- Preserve `strict` e `strictTemplates`; não desative verificações para contornar erros.
- Não use `any`, `@ts-ignore`, casts inseguros, non-null assertion (`!`) ou tipos amplos sem justificar e isolar o motivo.
- Prefira `unknown` com narrowing/validação para dados externos não confiáveis.
- Use tipos e interfaces explícitos nos limites com APIs; não confunda DTO de transporte com modelo de domínio quando a diferença for relevante.
- Prefira propriedades `readonly` e imutabilidade quando apropriado; nunca modifique arrays/objetos armazenados em Signals de modo silencioso.
- Nomeie arquivos em `kebab-case` e mantenha classes/variáveis coerentes com seu propósito; siga a convenção moderna do Angular CLI e do repositório.
- Um conceito principal por arquivo; coaloque `*.spec.ts` ao lado do código testado.
- Funções e componentes devem ter responsabilidades pequenas, mas não faça microfragmentação artificial.
- Comentários explicam **por que**, decisões e trade-offs; não descrevam o óbvio.
- Proíba código morto, imports não usados, comentários de implementação abandonada e TODOs sem contexto.

## 7. HTTP, formulários, validação e estado

- Configure HTTP com `provideHttpClient()` e interceptors funcionais quando necessários.
- Encapsule integração com APIs em serviços de `data-access`; nunca espalhe URLs e tratamento de erros em páginas.
- Para leituras HTTP reativas, considere `httpResource()` quando adequado (estável no Angular 22); para comandos/mutações, use `HttpClient` e trate estados de envio, sucesso e falha.
- Não suponha que o tipo genérico `http.get<T>()` valide JSON em runtime. Valide payloads externos quando a integridade dos dados exigir.
- Para formulários novos, prefira **Signal Forms** (`@angular/forms/signals`), estável no Angular 22. Use Reactive Forms tipados quando integrações ou requisitos justificarem.
- Toda entrada deve ter validação clara e mensagens acessíveis; validação de segurança também deve existir no backend.
- Exponha explicitamente `loading`, `empty`, `error` e `success` nas experiências assíncronas pertinentes.
- Não use gerenciador global de estado por padrão. Evolua de estado local para estado por feature e somente então avalie bibliotecas externas.
- Centralize configuração de endpoints por ambiente sem colocar segredos em bundles frontend.

## 8. Site público agora; plataforma depois

- Site institucional: priorize **SEO, semântica HTML, conteúdo indexável, acessibilidade, performance e Core Web Vitals**.
- Para páginas públicas predominantemente estáticas, avalie **prerender/SSG** do Angular; use SSR quando houver necessidade real de conteúdo dinâmico indexável.
- Implemente títulos, descrições, canonical, Open Graph, sitemap e robots de acordo com as rotas públicas efetivamente existentes.
- Evite animações pesadas e bibliotecas de efeito sem necessidade; respeite `prefers-reduced-motion` e navegação por teclado.
- Para a plataforma futura, priorize autenticação, autorização no backend, isolamento por feature, estados de dados, tratamento de falhas e observabilidade.
- Não desenvolva código especulativo da plataforma até existir uma funcionalidade solicitada.

## 9. Segurança por padrão (regras obrigatórias)

**Princípio:** toda funcionalidade deve ser projetada e revisada sob a ótica da segurança desde o início (*security by design* e *secure by default*). Considere toda entrada externa, resposta de API, URL, cookie, parâmetro de rota e conteúdo de terceiros como **não confiável**. Não reduza a segurança para ganhar velocidade ou contornar erros.

### 9.1. Modelo de ameaças e responsabilidade

- Antes de implementar login, sessão, permissões, dados pessoais, operações financeiras, formulários públicos, uploads ou integrações de terceiros, identifique resumidamente: **dados sensíveis, superfícies de ataque, atores, riscos, controles e responsabilidades do frontend/backend/infra**.
- Considere os riscos relevantes do **OWASP Top 10**, **OWASP API Security Top 10** e **OWASP ASVS**; use a lista como referência de revisão, não como alegação automática de conformidade.
- Garanta o princípio do menor privilégio e a política de **negação por padrão (deny by default)**.
- Nunca confunda controles de interface com barreiras de segurança: esconder um botão, bloquear uma rota ou validar um formulário no navegador **não concede nem impede autorização real**.
- Quando uma mitigação depender do backend, proxy, CDN, identidade ou infraestrutura, **declare expressamente a dependência**. Não simule segurança no Angular quando ela não existe no servidor.

### 9.2. Prevenção de XSS, injeções e manipulação insegura do DOM

- Utilize **interpolação, property binding e sanitização nativa do Angular**; nunca concatene conteúdo não confiável para construir templates Angular, JavaScript, CSS executável ou HTML.
- Não utilize `eval`, `new Function`, scripts dinâmicos com conteúdo de usuário, `document.write`, `nativeElement.innerHTML`, `outerHTML` ou APIs equivalentes para renderização de dados externos.
- Evite `[innerHTML]`; use texto comum sempre que possível. Se HTML for requisito real (ex.: conteúdo rico de um CMS), defina a política de sanitização para o contexto correto e revise a origem e os elementos permitidos.
- **Não use `DomSanitizer.bypassSecurityTrust*` como atalho.** Qualquer exceção exige justificativa, validação da origem/URL, revisão de segurança e teste específico; nunca passe diretamente uma string controlada por usuário para um bypass.
- URLs vindas de usuários/APIs devem ser validadas conforme destino, esquema permitido (`https:` sempre que aplicável), origem e contexto. Evite `javascript:`, redirecionamentos abertos e recursos externos arbitrários.
- Para links externos com `target="_blank"`, considere `rel="noopener noreferrer"` quando apropriado. Para embeds/iframes, restrinja origens, recursos e permissões; use `sandbox` quando aplicável.
- Preserve compilação **AOT** em produção. Não monte templates dinâmicos com entrada de usuário nem utilize compilação JIT para renderizar conteúdo externo.

### 9.3. CSP, Trusted Types e cabeçalhos de segurança

- Planeje **Content Security Policy (CSP)** restritiva em produção: restrinja scripts, estilos, conexões, imagens, frames e destinos aos recursos efetivamente necessários. Evite `unsafe-eval` e `unsafe-inline` para scripts, não libere `*` sem justificativa.
- Avalie habilitar **Trusted Types** com as políticas mínimas necessárias ao Angular e aos chunks gerados pelo bundler. Não habilite `angular#unsafe-bypass` sem necessidade auditada.
- Configure CSP por **cabeçalhos HTTP** no servidor/CDN; quando for preciso nonce, ele deve ser **imprevisível e único por resposta**, compatível com o cache/SSR. Considere as estratégias atuais do Angular, incluindo `security.autoCsp` quando aplicável, sem copiar uma configuração que prejudique SSR, estilos ou lazy loading.
- Oriente a infraestrutura a usar **HTTPS/TLS** em produção e avaliar `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy` e `frame-ancestors` na CSP para proteção contra clickjacking.
- Não coloque configurações de cabeçalhos no TypeScript esperando que o navegador as aplique: elas pertencem ao servidor, CDN ou proxy. **Teste** a política com integrações e bibliotecas reais antes de forçar em produção.

### 9.4. Autenticação, sessões e autorização

- Quando houver login, prefira solução consolidada e revisada (padrões como **OIDC/OAuth 2.0 com Authorization Code + PKCE**, quando compatível), nunca um protocolo de autenticação improvisado.
- Dê preferência, quando viável, a sessões controladas pelo servidor/BFF com cookie de sessão **`HttpOnly`, `Secure` e `SameSite` apropriado**; atributos e estratégia dependem de domínios, fluxo de autenticação e necessidade de chamadas cross-site.
- **Não armazene tokens de acesso, refresh tokens, JWTs, IDs de sessão ou senhas em `localStorage`, `sessionStorage`, IndexedDB ou URLs.** Se uma integração exigir tokens acessíveis por JavaScript, documente o risco, avalie alternativas e não implemente silenciosamente uma exceção.
- Sessões precisam de expiração, revogação/logout no backend e controles contra session fixation; redirecionar para login ou apagar estado local, isoladamente, não invalida uma sessão comprometida.
- Route guards e controle de visibilidade são somente mecanismos de UX; toda API deve verificar no servidor **identidade, permissões e escopo do recurso** a cada acesso. Negue acesso por padrão.
- Proteja contra **IDOR/BOLA**: alterar `userId`, `tenantId`, `accountId`, `invoiceId` ou qualquer ID na URL/payload não pode permitir leitura, edição ou exclusão de dados de terceiros. Faça verificação do proprietário, vínculo à organização e permissão no **backend**.
- Não confie em papéis (`admin`, `role`, `permissions`) recebidos do frontend sem validação do servidor. Nunca trate IDs imprevisíveis como substitutos de autorização.
- Em plataforma multi-tenant, imponha o **isolamento por tenant no backend e na camada de dados**; no frontend, limpe estados/cache ao trocar usuário, organização ou encerrar sessão para evitar exposição acidental.

### 9.5. HTTP, CSRF, CORS e integrações

- Use `HttpClient` e interceptors funcionais apenas para responsabilidades transversais justificadas; não injete credenciais indiscriminadamente em toda URL externa.
- Para autenticação por cookie, implemente **proteção CSRF no backend** e configure a integração do Angular (`provideHttpClient` e, quando necessário, `withXsrfConfiguration`) conforme o contrato real da API. A proteção XSRF integrada **não cobre automaticamente todas as chamadas cross-origin**.
- O atributo `SameSite` é defesa adicional, **não substitui** uma estratégia CSRF completa. Requisições que alteram estado não devem ser feitas com `GET`.
- Configure **CORS de forma restrita no backend**, por origem permitida, métodos e cabeçalhos necessários. Nunca use `Access-Control-Allow-Origin: *` com credenciais.
- Utilize HTTPS em produção; não desabilite verificação TLS, não aceite certificados inválidos e não ignore erros de segurança para facilitar o desenvolvimento.
- Parametrize dados em URLs e corpo de requisições; toda validação de esquema e autorização de operações também deve ser aplicada na API. SQL injection e command injection são mitigadas essencialmente no backend.
- Trate `401`, `403`, `429` e falhas de rede de forma correta; não implemente retry indiscriminado em operações financeiras ou mutações não idempotentes. Para repetição segura, coordene a idempotência com o backend.

### 9.6. Formulários públicos, uploads e dados sensíveis

- Valide entradas no Angular para experiência do usuário e **novamente no backend** para segurança. Defina tamanho máximo, formato, limites, normalização e regras do domínio sem confiar apenas no formulário.
- Proteja formulários públicos contra abuso com controles do **backend/edge** (rate limiting, cotas, detecção de bots, validação e proteção contra automação conforme risco). CAPTCHA sozinho não é uma garantia de segurança.
- Para uploads, limite tamanho e tipos aceitos no frontend, mas exija **validação real no servidor** (conteúdo/assinatura, permissões, armazenamento seguro, nome de arquivo e análise de malware quando aplicável).
- Aplique minimização de dados: não solicite nem retenha dados pessoais desnecessários; evite dados de clientes, documentos, CPF, informações bancárias, credenciais e payloads sensíveis em logs, analytics, URLs e mensagens de erro.
- Não revele stack traces, detalhes internos, segredos, consultas SQL ou respostas brutas de erros do servidor ao usuário. Registre eventos técnicos de forma controlada e com dados sensíveis mascarados.
- Para operações de alto impacto (cobranças, pagamentos, exclusões, permissões), exija confirmações apropriadas na UI e controles de autorização, consistência, auditoria e idempotência no backend. Uma confirmação visual não substitui controles de segurança.

### 9.7. Segredos, dependências, build, CI/CD e SSR

- **Nunca** inclua chaves privadas, segredos de API, credenciais, tokens ou certificados secretos em `environment.ts`, variáveis `NG_APP_*`, arquivos públicos, bundle do Angular, repositório ou exemplos. Configuração frontend é **pública por definição**.
- Integrações que exigem segredo devem passar por um backend/BFF protegido. Não tente ocultar um segredo por obfuscação, Base64, variáveis de ambiente de build ou minificação.
- Evite dependências sem manutenção, com baixa confiabilidade ou permissões excessivas. Avalie impacto e licenças; preserve lockfile e use instalações reproduzíveis em CI (por exemplo, `npm ci` quando npm estiver em uso).
- Execute auditoria de dependências, verificação de segredos e análise estática quando disponíveis. **Não aplique `npm audit fix --force`, ignore CVEs ou faça upgrade de major automaticamente** sem avaliar breaking changes e riscos.
- Separe ambientes e permissões; não permita que testes usem APIs, credenciais ou dados reais de produção inadvertidamente.
- Em SSR/SSG, não serialize cookies, tokens, headers de autenticação, informações privadas ou credenciais em HTML, `TransferState`, logs ou payloads públicos; configure cache de páginas autenticadas com cuidado para impedir vazamento entre usuários.
- Se usar SSR atrás de proxy/CDN, confie apenas em cabeçalhos `Forwarded`/`X-Forwarded-*` de proxies efetivamente confiáveis; revise host validation, redirecionamentos e destinos externos para mitigar spoofing e SSRF.

### 9.8. Testes de segurança e condição de conclusão

- Para qualquer funcionalidade com autenticação, permissões ou dados privados, cubra cenários de **não autenticado, sem permissão, sessão expirada, recurso de outro usuário/tenant, entrada inválida e resposta de erro**.
- Em interfaces que renderizam texto/HTML/URLs de terceiros, teste conteúdo malicioso e confirme que ele não é executado. Se houver cookies autenticados, teste CSRF em conjunto com o backend.
- Para rotas/API e operações sensíveis, recomende testes de integração/E2E e testes negativos; jamais declare comprovada a segurança do backend quando somente o frontend foi analisado.
- Ao terminar alterações de risco relevante, reporte: **riscos observados, proteções aplicadas, dependências de backend/infra, testes executados e pendências**. Não declare uma funcionalidade "100% segura".
- **Regra de bloqueio:** se um requisito exigir armazenar segredos no browser, desabilitar sanitização/XSRF/TLS, pular autorização no servidor ou expor informações de outro usuário/tenant, **não implemente a solução insegura**. Explique o risco e proponha a arquitetura segura antes de continuar.

## 10. Acessibilidade e desempenho

- Use HTML semântico, labels, foco visível, mensagens de erro associadas e contraste mínimo WCAG 2.2 AA.
- Para imagens elegíveis, utilize `NgOptimizedImage`, dimensões apropriadas, lazy loading e textos alternativos significativos.
- Divida rotas grandes em chunks, evite dependências pesadas e meça antes de otimizar.
- Para código com SSR/SSG, não acesse diretamente `window`, `document` ou `localStorage` durante renderização no servidor.

## 11. Testes e qualidade

- Use o framework de testes **configurado no projeto**; em novos projetos Angular CLI 22, o padrão é Vitest.
- Crie ou atualize testes para regras de negócio, estado, interações relevantes, validação, fluxos assíncronos, regressões e cenários negativos de segurança quando aplicáveis.
- Prefira testes de comportamento aos de detalhes internos de implementação.
- Mocke integrações externas nos testes unitários. Não dependa de rede real, serviços de produção ou credenciais reais.
- Recomende testes end-to-end para jornadas críticas quando a infraestrutura de E2E existir.
- Antes de declarar conclusão, execute os scripts existentes de lint, testes e build, quando disponíveis; reporte os comandos e resultados reais.
- Não declare que algo passou sem executar; se não for possível rodar, explique por quê.

## 12. Fluxo de trabalho obrigatório para cada solicitação

1. **Entenda:** leia os arquivos afetados, `package.json`, rotas e convenções antes de propor mudanças.
2. **Planeje:** para alterações não triviais, indique arquivos, feature responsável, fluxo de dados e riscos em poucas linhas.
3. **Implemente:** faça a menor alteração consistente, sem refatorações aleatórias ou bibliotecas não solicitadas.
4. **Valide:** confira tipos, erros, cenários vazios, loading, acessibilidade, segurança (seção 9) e testes adequados.
5. **Reporte:** resuma arquivos alterados, decisões, validações executadas, riscos de segurança relevantes e eventuais pendências reais.

- Quando houver ambiguidade com impacto arquitetural importante, apresente opções e recomende uma; não invente requisitos de negócio.
- Não altere dependências, scripts, convenções, versões, arquitetura de autenticação ou pipeline sem justificar explicitamente.
- Não apague código, testes ou arquivos existentes para “resolver” erros de compilação.
- Se uma solução for provisória, identifique a limitação e a alternativa adequada.
- Sempre que eu pedir explicação, ensine o conceito Angular utilizado e o motivo da decisão com um exemplo curto, sem transformar a resposta em aula desnecessária.

## 13. Referências oficiais e atualização

- Práticas Angular: https://angular.dev/ai/develop-with-ai
- Style guide: https://angular.dev/style-guide
- Angular Router: https://angular.dev/guide/routing
- Rendering híbrido: https://angular.dev/guide/hybrid-rendering
- Testes: https://angular.dev/guide/testing
- AI config e MCP: https://angular.dev/cli/generate/ai-config e https://angular.dev/ai/mcp
- Segurança oficial do Angular: https://angular.dev/best-practices/security
- Configuração XSRF do Angular: https://angular.dev/api/common/http/withXsrfConfiguration
- OWASP Top 10: https://owasp.org/www-project-top-ten/
- OWASP API Security Top 10: https://owasp.org/API-Security/
- OWASP ASVS: https://owasp.org/www-project-application-security-verification-standard/
- OWASP Session Management: https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html
- OWASP CSRF Prevention: https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html

**Regra final:** escolha a menor solução que respeite as fronteiras do domínio, a segurança por padrão e permaneça fácil de entender, testar e evoluir. Arquitetura boa não é a que possui mais camadas; é a que suporta o produto com clareza, baixo custo de mudança e proteção proporcional aos riscos.
