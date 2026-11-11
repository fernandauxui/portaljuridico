# Protótipo responsivo · Portal Jurídico

Um único link com o Portal Jurídico inteiro. Dados 100% fictícios.

- **Desktop (≥ 1024 px):** os 13 módulos do Figma, já com as telas novas (09.15 com cards, aba Documentos, filtros de Meses, Débito, Processo, Advogado e Dias em atraso, Suporte etc.) e todas as ações.
- **Celular e tablet (< 1024 px), ou aberto em aparelho de toque:** só o fluxo mobile de consulta (o protótipo mobile original), com o aviso "Versão de consulta" a cada entrada no mobile.
- **Ao cruzar o breakpoint:** vai para a tela equivalente (detalhe da unidade, Meu perfil, Suporte ou telas de acesso). Sem equivalente, cai em Unidades.
- **Pontos em aberto** aparecem como um ícone amarelo discreto nas telas e listados em "Sobre o protótipo", no menu lateral.

## Como gerar

```
cd prototipo-responsivo
python3 build.py
```

O `build.py` lê `src/mobile-base.html` (o protótipo mobile original, base do fluxo mobile e dos dados), junta com as telas desktop de `src/` e gera:

- `index.html` (arquivo único);
- `../prototipo-mobile/index.html` (mesmo arquivo, para o link público antigo continuar funcionando);
- `artifact.html` (versão para publicar como artefato).

Para mudar o fluxo mobile, edite `src/mobile-base.html` e rode o build de novo.

> Cobrança e boletos: descontos, juros, encargos e envio de boletos têm impacto de CDC, LGPD e Bacen. Validar regras e textos com o Jurídico antes de produção.
