1. Objetivo Principal do Projeto:
Criar uma aplicação web no formato de um "hub" centralizado para uma Organização Não Governamental (ONG). A aplicação deve consolidar duas ferramentas essenciais em um único lugar: um sistema para gestão de materiais e empréstimos, e um sistema para gestão de alunos, incluindo controle de presença e atividades. O público-alvo são os administradores e educadores da ONG.
A paleta de cores do site deve seguir: #d09c91 #d5c4aa #7f6e62 #d9b396 #88957d #c8cbba
E a logo deve ser a foto que está anexada. 
2. Estrutura Geral e Tela Inicial (Hub):
A aplicação inicia em uma tela de "Hub" que serve como ponto de entrada para os dois módulos principais.
Layout: A tela deve apresentar dois cards de navegação distintos e claros:
Card 1: "Gestão de Alunos" - Leva ao sistema de gerenciamento de crianças.
Card 2: "Gestão de Materiais" - Leva ao sistema de controle de inventário e empréstimos.

Módulo 1: Sistema de Gestão de Materiais

Este módulo é focado no controle de inventário e no rastreamento de empréstimos de materiais.
A. Tela Principal (Navegação por Abas):
O header principal desta seção deve conter duas abas para alternar entre as visualizações: "Materiais" e "Empréstimos Solidários".

Header
Logo da plataforma.


Abas de navegação: Materiais e Empréstimos Solidários.
Botão de Logout à direita.
B. Aba "Materiais":
Título centralizado: "Materiais que estão em falta".
Carrossel de Destaque: No topo da página, um carrossel horizontal de cards deve exibir os materiais que estão em falta no estoque.
Ferramentas de Gestão:
Uma barra de pesquisa para encontrar materiais específicos.
Um menu ou botão de filtro ao lado da pesquisa.
Um botão de ação principal: "Cadastrar Material".
Título secundário: "Materiais Gerais".
Listagem de Materiais:
Uma grade ou lista de cards, cada um representando um item do inventário.
Cada card deve exibir informações essenciais (nome do item, quantidade atual).
Cada card deve conter botões de ação rápida para adicionar (+) e remover (-) unidades do estoque daquele item.
Fluxo de Edição: Ao clicar em qualquer parte de um card de material, o usuário é redirecionado para uma tela de detalhes, onde pode visualizar e editar todas as informações do item.
C. Aba "Empréstimos":
Título centralizado: "Empréstimos que passaram da data de devolução".
Carrossel de Destaque: No topo da página, um carrossel horizontal de cards deve exibir os materiais que já passaram da data de devolução.
Título secundário: "Categorias".
Filtro por Categoria: Um mini carrossel de categorias (bolinhas com ícone + legenda por ex: Livros, Jogos, Ferramentas) permite filtrar a lista de materiais a serem emprestados abaixo.
Ferramentas de Gestão:
Uma barra de pesquisa para encontrar empréstimos específicos.
Um menu ou botão de filtro adicional.
Um botão de ação principal: "Adicionar Empréstimo".
Título secundário: "Empréstimos Gerais".
Listagem de Empréstimos:
Uma lista/grid exibindo todos os materiais atualmente emprestados e ainda não devolvidos.
Cada item na lista deve mostrar informações chave (nome do item, quem pegou, data).
Fluxo de Edição: Ao clicar em um item da lista, o usuário pode editar as informações do empréstimo (ex: registrar a devolução).
D. Pop-ups de Cadastro:
Pop-up "Cadastrar Novo Material": Acionado pelo botão correspondente, deve conter os seguintes campos:
Item (Nome do material)
Quantidade (inicial)
Descrição
Categoria (um campo de seleção com opções pré-definidas)
Pop-up "Cadastrar Empréstimo": Acionado pelo botão correspondente, deve conter os seguintes campos:
Nome do Item (seleção de um item existente)
Quantidade Emprestada
Solicitante (Quem pegou o item)
Data da Entrega
Autorizado por
Entregue por
Categoria do Item (preenchido automaticamente ao selecionar o item)

Módulo 2: Sistema de Gestão de Alunos e Presença

Este módulo foca no gerenciamento de informações dos alunos, atividades diárias e controle de frequência. A navegação principal deste módulo é feita por uma sidebar (barra de navegação lateral).
A. Estrutura da Sidebar:
MENU:
Visão Geral (Dashboard)
Alunos
Mulheres
GERAL:
Configurações
Ajuda
Sair
B. Tela "Visão Geral" (Dashboard):
Esta é a tela inicial ao entrar neste módulo.
Gráfico de Análise da Semana: Um gráfico de barras mostrando a frequência de alunos por dia da semana (D, S, T, Q, Q, S, S).
Cards de Indicadores (KPIs):
Total de Alunos: Número total de crianças matriculadas.
Faltas: Número de ausências no dia ou na semana.
Atividade do Dia: Um card destacando a atividade agendada para hoje, com opção de "Visualizar" ou "Editar".
Lembretes: Um espaço para anotações ou lembretes importantes.
Calendário: Uma visualização de calendário que permite ao usuário:
Selecionar um dia para filtrar os dados do dashboard.
Clicar em um dia para iniciar o fluxo de "Fazer a Chamada do Dia".
Botão "+ Atividade": Um botão de ação para redirecionar à tela de criação de atividade.
C. Tela "Criação de Evento/Atividade":
Um formulário para cadastrar novas atividades com os seguintes campos:
Responsável pela Atividade
Quantidade de Vagas
Descrição (detalhes sobre a atividade)
Foto da Atividade (campo para upload de imagem)
D. Tela "Chamada do Dia":
Uma lista vertical com o nome e a foto de cada aluno matriculado.
Para cada aluno, deve haver opções para marcar sua situação:
Presente
Faltou
Falta Justificada (checkbox ou opção adicional)
E. Tela "Alunos":
Listagem de Alunos: Exibe uma lista com todos os alunos matriculados na ONG.
Botão de Ação: Um botão para "Cadastrar Novo Aluno".
F. Tela de "Cadastro de Novo Aluno":
Um formulário completo para registrar um aluno, com os seguintes campos:
Nome Completo
Qual comunidade pertence? (campo de texto ou seleção)
Foto do Aluno (upload)
Idade
Pode voltar sozinho? (Sim/Não)
Observações (campo de texto para restrições alimentares, alergias, medicamentos, etc.)
Informações do Responsável:
Nome do Responsável
Telefone de Contato
G. Tela de "Perfil do Aluno":
Acessada ao clicar em um aluno na lista da tela "Alunos".
Exibe todas as informações cadastradas sobre aquele aluno específico em modo de visualização, com uma opção para "Editar".
