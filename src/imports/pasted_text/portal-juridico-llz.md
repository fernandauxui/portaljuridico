Projete um Portal Jurídico moderno para a empresa LLZ Garantidora.



CONTEXTO DO NEGÓCIO



Hoje os advogados utilizam o SIGGA, portal interno da LLZ.



O SIGGA possui centenas de funcionalidades destinadas aos colaboradores internos da empresa.



Os escritórios parceiros utilizam apenas uma pequena parte dessas funcionalidades.



Além disso:



novos escritórios serão incorporados futuramente;

o acesso atual expõe funcionalidades desnecessárias;

a experiência não foi pensada para usuários externos.



Por esse motivo será criado um Portal Jurídico exclusivo para escritórios parceiros.



OBJETIVO DO PRODUTO



Criar um portal dedicado para escritórios de advocacia parceiros.



O portal deve permitir que cada escritório tenha acesso apenas às unidades sob sua responsabilidade.



PERFIL DOS USUÁRIOS



Usuário principal:



Advogado de escritório parceiro.



Características:



utiliza diariamente o sistema;

trabalha com dezenas ou centenas de unidades;

precisa localizar rapidamente informações;

realiza tarefas repetitivas;

normalmente trabalha em desktop;

pode acessar em notebook e celular;

utiliza múltiplas abas;

necessita rastreabilidade completa.



FLUXO GERAL



Operador interno da LLZ dentro do SIGGA:



cadastra escritório



↓



cadastra advogados



↓



vincula unidades



↓



advogado recebe acesso via email ao Portal Jurídico LLZ



↓



login



↓



MFA



↓



Dashboard



↓



visualiza unidades



↓



opera processos



↓



recebe notificações



↓



pagamento integral recebido



↓



conclui processo



↓



unidade desvinculada automaticamente



↓



histórico permanece disponível em relatório somente leitura



FUNCIONALIDADES



O portal deverá conter:



Login

e-mail

senha

MFA

recuperação de senha

primeiro acesso

política de senha

Dashboard



Apresentar visão geral.



Exibir indicadores relevantes como:



Unidades ativas



Processos ativos



Pagamentos aguardando conclusão



Processos concluídos



Novas unidades recebidas



Pendências



Notificações recentes



Próximos vencimentos



Últimas movimentações



A dashboard deve permitir iniciar rapidamente as principais tarefas.



Minhas Unidades



Tela principal.



Tabela moderna.



Filtros avançados.



Pesquisa rápida.



Ordenação.



Paginação.



Colunas configuráveis.



Status visual.



Badges.



Ações rápidas.



Detalhe da Unidade



Página completa contendo:



Resumo



Dados do proprietário



Dados da unidade



Condomínio



Informações financeiras



Timeline



Histórico



Processos



Documentos



Débitos



Observações



Notificações



Atualização Cadastral



Editar:



Nome



CPF



Telefone



E-mail



Toda alteração deve gerar histórico.



Processo



Criar processo



Editar processo



Encerrar processo



Visualizar andamento



Adicionar observações



Timeline completa



Histórico de alterações



Emissão



Planilha de débitos



Extrato PDF



Novo Vencimento



Acordo



Todas seguindo regras já existentes no SIGGA.



Histórico



Visualizar:



ações do advogado



ações LLZ



mudanças cadastrais



alterações de processo



data



hora



usuário



descrição



Relatórios



Após encerramento do processo:



somente leitura



Unidade



Condomínio



Período



Honorários



Valores



Situação



Status



Exportação PDF



Exportação Excel



Notificações



Nova unidade



Pagamento recebido



Alteração importante



Mudança de status



Aprovação



Conclusão



Permitir:



marcar como lida



filtrar



pesquisar



Perfil



Alterar senha



Alterar dados



Gerenciar MFA



Sessões ativas



Dispositivos autorizados



PERMISSÕES



Cada advogado possui permissões herdadas do SIGGA.



Todo botão deve respeitar essas permissões.



Exemplo:



Pode visualizar



Pode editar



Pode emitir documentos



Pode gerar acordo



Pode gerar novo vencimento



Pode concluir processo



Pode apenas consultar



SEGURANÇA



Implementar conceitos de:



MFA



Sessão expirada



Timeout



Proteção contra acesso por URL



Controle por escritório



Logs



Auditoria



Histórico



Bloqueio por tentativas



Mensagens seguras



Nenhuma informação sensível deve ser exibida sem autorização.



DASHBOARD



Projetar uma dashboard extremamente útil.



Não utilizar apenas gráficos.



Priorizar produtividade.



Utilizar:



Cards



Alertas



Widgets



Lista de atividades



Pendências



Atalhos



Indicadores



Timeline



TABELAS



As tabelas devem ser referência em UX.



Permitir:



Pesquisa



Filtros



Ordenação



Paginação



Salvar filtros



Exportar



Redimensionar colunas



Colunas configuráveis



Ações rápidas



Sticky Header



Responsividade



SISTEMA DE STATUS



Utilizar badges consistentes.



Exemplos:



Em andamento



Novo



Pago



Concluído



Pendente



Cancelado



Aguardando ação



Encerrado



TIMELINE



Cada unidade deve possuir uma timeline completa.



Mostrar:



Data



Hora



Usuário



Tipo da ação



Descrição



Ícone



Categoria