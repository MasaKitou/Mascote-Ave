"use strict";

/* ================== METADADOS ENRIQUECIDOS DAS AVES ================== */
// Chaves normalizadas (sem acentos, minúsculas) pelo nome popular ou científico.
const METADADOS_AVES = {
  "arara-azul-grande": {
    cores: ["azul", "amarelo", "preto"],
    regioes: ["norte", "nordeste", "centro-oeste"],
    subregioes: ["Pantanal", "Cerrado", "Amazônia"],
    locais: ["Mato Grosso", "Mato Grosso do Sul", "Pará", "Bahia", "Piauí", "Tocantins"],
    porte: "Grande",
    habitat: "Matas de galeria, buritizais, cerradões e áreas abertas com palmeiras no Pantanal.",
    canto: "Vocalização forte, rouca e metálica ('kraaa'), ouvida a longas distâncias durante o voo.",
    curiosidades: [
      "É a maior espécie de arara do mundo, podendo chegar a 1 metro de comprimento.",
      "Seu bico é tão forte que consegue quebrar cocos de acuri e bocaiuva com facilidade.",
      "Costuma viver em casais fiéis que permanecem juntos por toda a vida.",
      "Mais de 90% da sua dieta no Pantanal vem de apenas duas espécies de palmeiras."
    ],
    skin: { corpo: "#1557c0", asa: "#0d3b8c", barriga: "#1c6be8", bico: "#22252a", anel: "#f4c430", rabo: "#0f46a3" }
  },
  "arara-vermelha-grande": {
    cores: ["vermelho", "azul", "verde", "amarelo"],
    regioes: ["norte", "nordeste", "centro-oeste", "sudeste"],
    subregioes: ["Amazônia", "Cerrado", "Pantanal", "Mata Atlântica"],
    locais: ["Amazonas", "Pará", "Mato Grosso", "Goiás", "Bahia", "Minas Gerais"],
    porte: "Grande",
    habitat: "Florestas úmidas, matas de várzea e paredões rochosos próximos a rios.",
    canto: "Grasnados graves e estridentes emitidos em duplas ou pequenos bandos ao amanhecer.",
    curiosidades: [
      "Pode viver mais de 50 anos na natureza e até 70 anos sob cuidados humanos.",
      "Diferente da arara-canga, possui faixas verdes nas asas e linhas de penas vermelhas no rosto.",
      "Frequenta barreiros de argila para neutralizar toxinas de sementes que consome."
    ],
    skin: { corpo: "#c92a2a", asa: "#2b8a3e", barriga: "#b02121", bico: "#f1efe7", anel: "#fff5f5", rabo: "#1971c2" }
  },
  "arara-caninde": {
    cores: ["azul", "amarelo", "preto"],
    regioes: ["norte", "nordeste", "centro-oeste", "sudeste"],
    subregioes: ["Amazônia", "Cerrado", "Pantanal"],
    locais: ["Mato Grosso", "Goiás", "Tocantins", "Pará", "São Paulo", "Minas Gerais"],
    porte: "Grande",
    habitat: "Florestas tropicais, cerrados, veredas de buritis e áreas arborizadas.",
    canto: "Grito alto e agudo ('raaa-raaa') quando voa em bando ao entardecer.",
    curiosidades: [
      "Tem o dorso azul-turquesa vibrante e o peito inteiramente amarelo-ouro.",
      "A mancha preta sob o queixo ajuda a diferenciá-la de outras araras amarelas.",
      "É uma das aves-símbolo do Cerrado e nidifica em ocos de buritis mortos."
    ],
    skin: { corpo: "#1890d5", asa: "#106ba3", barriga: "#f5b700", bico: "#1e2022", anel: "#f8f9fa", rabo: "#106ba3" }
  },
  "ararinha-azul": {
    cores: ["azul", "cinza"],
    regioes: ["nordeste"],
    subregioes: ["Caatinga"],
    locais: ["Bahia", "Curaçá", "Vale do São Francisco"],
    porte: "Médio",
    habitat: "Matas ciliares de caraibeiras ao longo de riachos temporários na Caatinga.",
    canto: "Chamado nasalado e agudo, parecido com um 'whichaka' curto e repetido.",
    curiosidades: [
      "É endêmica da Caatinga baiana e inspiração do filme 'Rio'.",
      "Depende fortemente da árvore caraibeira para fazer seus ninhos e se abrigar.",
      "Passou por um intenso programa internacional de reintrodução na natureza na Bahia."
    ],
    skin: { corpo: "#4ea8de", asa: "#2d6a9f", barriga: "#72efdd", bico: "#212529", anel: "#495057", rabo: "#2d6a9f" }
  },
  "arara-azul-de-lear": {
    cores: ["azul", "amarelo"],
    regioes: ["nordeste"],
    subregioes: ["Caatinga"],
    locais: ["Bahia", "Raso da Catarina", "Canudos"],
    porte: "Grande",
    habitat: "Cânions de arenito e áreas de Caatinga com palmeiras de licuri.",
    canto: "Grito áspero e grave, mais agudo que o da arara-azul-grande.",
    curiosidades: [
      "Dorme e faz ninhos em fendas de grandes paredões de arenito no Raso da Catarina.",
      "Sua principal fonte de alimento é o coco da palmeira licuri.",
      "Ficou mais de um século sem ter sua área exata de ocorrência conhecida pela ciência."
    ],
    skin: { corpo: "#1d4ed8", asa: "#1e3a8a", barriga: "#2563eb", bico: "#1f2937", anel: "#facc15", rabo: "#1e40af" }
  },
  "papagaio-verdadeiro": {
    cores: ["verde", "amarelo", "azul", "vermelho"],
    regioes: ["norte", "nordeste", "centro-oeste", "sudeste", "sul"],
    subregioes: ["Cerrado", "Pantanal", "Caatinga", "Mata Atlântica"],
    locais: ["Mato Grosso do Sul", "Bahia", "Minas Gerais", "São Paulo", "Paraná"],
    porte: "Médio",
    habitat: "Florestas abertas, cerrados, palmeirais e bordas de mata.",
    canto: "Sons variados, assobios melodiosos e chamados estridentes em voo.",
    curiosidades: [
      "Tem grande capacidade de imitar sons e palavras humanas.",
      "Possui a testa azul-turquesa e o encontro das asas vermelho vivo.",
      "Costuma formar grandes dormitórios coletivos no fim da tarde."
    ],
    skin: { corpo: "#2b9348", asa: "#1b4332", barriga: "#55a630", bico: "#343a40", anel: "#ffd166", rabo: "#2b9348" }
  },
  "tucano-toco": {
    cores: ["preto", "branco", "laranja", "amarelo"],
    regioes: ["norte", "nordeste", "centro-oeste", "sudeste", "sul"],
    subregioes: ["Cerrado", "Pantanal", "Mata Atlântica", "Amazônia"],
    locais: ["Mato Grosso", "Goiás", "Minas Gerais", "São Paulo", "Bahia"],
    porte: "Grande",
    habitat: "Cerrados, matas de galeria, capões de mata e até áreas urbanas arborizadas.",
    canto: "Série de notas graves e secas ('rek-rek-rek') semelhantes a um coaxar.",
    curiosidades: [
      "Seu bico enorme é muito leve por dentro, feito de uma estrutura esponjosa de queratina.",
      "Usa o bico também para regular a temperatura corporal, liberando calor.",
      "É um importante dispersor de sementes de árvores nativas do Brasil."
    ],
    skin: { corpo: "#1a1d20", asa: "#111315", barriga: "#f8f9fa", bico: "#ff7b00", anel: "#3a86ff", rabo: "#111315" }
  },
  "tucano-de-bico-preto": {
    cores: ["preto", "amarelo", "branco", "vermelho"],
    regioes: ["norte", "nordeste", "centro-oeste", "sudeste"],
    subregioes: ["Amazônia", "Mata Atlântica", "Cerrado"],
    locais: ["Amazonas", "Pará", "Acre", "Bahia", "Espírito Santo"],
    porte: "Médio",
    habitat: "Copa de florestas úmidas e matas altas de terra firme.",
    canto: "Canto rítmico que lembra um latido suave ou 'qui-qui-qui' repetitivo.",
    curiosidades: [
      "Apesar do nome, a base do seu bico exibe uma faixa amarela ou azulada.",
      "Alimenta-se principalmente de frutos, mas também come insetos e pequenos vertebrados.",
      "Passa a maior parte do tempo no alto das copas das árvores."
    ],
    skin: { corpo: "#1f2421", asa: "#111", barriga: "#ffd60a", bico: "#212529", anel: "#4ea8de", rabo: "#d90429" }
  },
  "tuiuiu": {
    cores: ["branco", "preto", "vermelho"],
    regioes: ["norte", "centro-oeste", "nordeste"],
    subregioes: ["Pantanal", "Amazônia", "Cerrado"],
    locais: ["Mato Grosso", "Mato Grosso do Sul", "Pará", "Tocantins"],
    porte: "Grande",
    habitat: "Áreas alagadas, baías, rios rasos e campos inundáveis do Pantanal.",
    canto: "Quase silencioso; comunica-se principalmente batendo as metades do bico.",
    curiosidades: [
      "É a ave-símbolo do Pantanal e pode atingir 1,60 m de altura com 2,80 m de envergadura.",
      "Seu ninho gigante pode ser reutilizado por anos seguidos e pesar centenas de quilos.",
      "Possui um papo vermelho vivo na base do pescoço que infla quando está excitado."
    ],
    skin: { corpo: "#f8f9fa", asa: "#e9ecef", barriga: "#ffffff", bico: "#1b1d20", anel: "#d90429", rabo: "#1b1d20" }
  },
  "gaviao-real": {
    cores: ["cinza", "branco", "preto"],
    regioes: ["norte", "nordeste", "centro-oeste", "sudeste"],
    subregioes: ["Amazônia", "Mata Atlântica"],
    locais: ["Amazonas", "Pará", "Rondônia", "Mato Grosso", "Bahia", "Espírito Santo"],
    porte: "Grande",
    habitat: "Florestas tropicais densas e preservadas com árvores emergentes muito altas.",
    canto: "Grito agudo e prolongado perto do ninho; costuma ser silenciosa ao caçar.",
    curiosidades: [
      "Também chamada de harpia, é uma das maiores e mais poderosas águias do planeta.",
      "Suas garras traseiras podem ser maiores que as de um urso-pardo.",
      "Caça preguiças e macacos diretamente nas copas das árvores."
    ],
    skin: { corpo: "#495057", asa: "#343a40", barriga: "#f8f9fa", bico: "#212529", crista: "#6c757d", rabo: "#212529" }
  },
  "seriema": {
    cores: ["cinza", "marrom", "vermelho"],
    regioes: ["nordeste", "centro-oeste", "sudeste", "sul"],
    subregioes: ["Cerrado", "Caatinga", "Pantanal", "Pampas"],
    locais: ["Goiás", "Minas Gerais", "Bahia", "Mato Grosso", "São Paulo"],
    porte: "Grande",
    habitat: "Campos abertos, cerrados, pastagens e áreas de vegetação baixa.",
    canto: "Canto estridente e inconfundível em dueto, ouvido a mais de 1 km de distância.",
    curiosidades: [
      "É parente distante das extintas 'aves do terror' pré-históricas da América do Sul.",
      "Prefere correr pelo chão (até 50 km/h) a voar quando precisa fugir.",
      "Costuma bater cobras e lagartos contra pedras antes de engoli-los."
    ],
    skin: { corpo: "#b5a68e", asa: "#8c7a61", barriga: "#dfd6c7", bico: "#d9480f", crista: "#8c7a61", rabo: "#73634e" }
  },
  "carcara": {
    cores: ["marrom", "branco", "preto", "laranja"],
    regioes: ["norte", "nordeste", "centro-oeste", "sudeste", "sul"],
    subregioes: ["Caatinga", "Cerrado", "Pampas", "Pantanal", "Mata Atlântica"],
    locais: ["Todo o Brasil", "Bahia", "Rio Grande do Sul", "Minas Gerais", "Goiás"],
    porte: "Médio",
    habitat: "Campos, cerrados, caatingas, beiras de estrada e áreas urbanas.",
    canto: "Som áspero que lembra um matraquear ('krã-krã-krã'), inclinando a cabeça para trás.",
    curiosidades: [
      "Embora pertença à família dos falcões, passa bastante tempo caminhando no solo.",
      "A pele nua do rosto muda de cor (de alaranjado para amarelo) conforme seu estado emocional.",
      "É uma ave extremamente oportunista e adaptável a ambientes modificados."
    ],
    skin: { corpo: "#5c4033", asa: "#3d281e", barriga: "#f5ebe0", bico: "#adb5bd", anel: "#f77f00", rabo: "#2b1d16" }
  },
  "coruja-buraqueira": {
    cores: ["marrom", "branco", "amarelo"],
    regioes: ["norte", "nordeste", "centro-oeste", "sudeste", "sul"],
    subregioes: ["Cerrado", "Pampas", "Caatinga", "Mata Atlântica"],
    locais: ["Todo o Brasil", "São Paulo", "Rio Grande do Sul", "Goiás", "Ceará"],
    porte: "Pequeno",
    habitat: "Campos abertos, gramados, pastagens, dunas e parques urbanos.",
    canto: "Assobio suave de duas sílabas e estalos de bico quando se sente ameaçada.",
    curiosidades: [
      "Ao contrário da maioria das corujas, é muito ativa durante o dia.",
      "Vive em tocas cavadas no chão ou aproveita buracos abandonados por tatus.",
      "Consegue girar a cabeça em até 270 graus para observar os arredores."
    ],
    skin: { corpo: "#8d6e63", asa: "#6d4c41", barriga: "#efebe9", bico: "#f9c74f", anel: "#ffd60a", rabo: "#5d4037" }
  },
  "ema": {
    cores: ["cinza", "marrom", "branco"],
    regioes: ["nordeste", "centro-oeste", "sudeste", "sul"],
    subregioes: ["Cerrado", "Pampas", "Caatinga", "Pantanal"],
    locais: ["Rio Grande do Sul", "Mato Grosso do Sul", "Goiás", "Bahia", "Minas Gerais"],
    porte: "Grande",
    habitat: "Campos limpos, cerrados abertos e pampas sulinos.",
    canto: "Som grave e abafado emitido pelo macho na época reprodutiva, parecido com um tambor.",
    curiosidades: [
      "É a maior ave do Brasil, podendo passar de 1,50 m de altura, mas não voa.",
      "Quem choca os ovos e cuida dos filhotes é o macho, não a fêmea.",
      "Usa as asas grandes como leme para mudar de direção rapidamente enquanto corre."
    ],
    skin: { corpo: "#8d99ae", asa: "#6c757d", barriga: "#edf2f4", bico: "#5c677d", rabo: "#495057" }
  },
  "sabia-laranjeira": {
    cores: ["marrom", "laranja"],
    regioes: ["nordeste", "centro-oeste", "sudeste", "sul"],
    subregioes: ["Mata Atlântica", "Cerrado", "Pampas", "Caatinga"],
    locais: ["São Paulo", "Rio de Janeiro", "Minas Gerais", "Paraná", "Rio Grande do Sul", "Bahia"],
    porte: "Pequeno",
    habitat: "Matas, pomares, praças, quintais e jardins arborizados.",
    canto: "Melodia longa, doce e flautada, muito ouvida antes do amanhecer na primavera.",
    curiosidades: [
      "É a ave-símbolo nacional do Brasil desde 2002.",
      "Seu nome vem do tupi e faz referência ao peito cor de laranja.",
      "Costuma cantar ainda de madrugada, antes de o sol nascer."
    ],
    skin: { corpo: "#7f5539", asa: "#582f0e", barriga: "#e85d04", bico: "#ffb703", rabo: "#582f0e" }
  },
  "bem-te-vi": {
    cores: ["amarelo", "marrom", "branco", "preto"],
    regioes: ["norte", "nordeste", "centro-oeste", "sudeste", "sul"],
    subregioes: ["Amazônia", "Caatinga", "Cerrado", "Mata Atlântica", "Pampas", "Pantanal"],
    locais: ["Todo o Brasil"],
    porte: "Pequeno",
    habitat: "Praticamente qualquer ambiente aberto com árvores, inclusive grandes cidades.",
    canto: "Canto onomatopeico claro e alegre que soa exatamente como 'bem-te-vi!'.",
    curiosidades: [
      "Esconde uma coroa de penas amarelas no alto da cabeça que só mostra quando irritado.",
      "Tem dieta variada: come insetos, frutas, pequenos peixes e até girinos.",
      "É valente e costuma perseguir gaviões e urubus para defender seu território."
    ],
    skin: { corpo: "#7f5539", asa: "#5e3d28", barriga: "#ffd60a", bico: "#1d2022", anel: "#ffffff", crista: "#ffd60a", rabo: "#5e3d28" }
  },
  "joao-de-barro": {
    cores: ["marrom", "branco"],
    regioes: ["nordeste", "centro-oeste", "sudeste", "sul"],
    subregioes: ["Cerrado", "Pampas", "Mata Atlântica", "Pantanal"],
    locais: ["Minas Gerais", "São Paulo", "Paraná", "Rio Grande do Sul", "Goiás", "Bahia"],
    porte: "Pequeno",
    habitat: "Campos, fazendas, postes, árvores esparsas e áreas urbanas.",
    canto: "Dueto vibrante e sincronizado entre o casal, acompanhado de bater de asas.",
    curiosidades: [
      "Constrói um ninho em formato de forno de barro que pode pesar até 5 kg.",
      "A entrada do ninho tem uma parede interna curva que protege os filhotes do vento e predadores.",
      "O casal constrói uma casa nova a cada temporada reprodutiva."
    ],
    skin: { corpo: "#b06c49", asa: "#8a4f30", barriga: "#f3e5d8", bico: "#4a3222", rabo: "#8a4f30" }
  },
  "quero-quero": {
    cores: ["cinza", "preto", "branco", "vermelho"],
    regioes: ["norte", "nordeste", "centro-oeste", "sudeste", "sul"],
    subregioes: ["Pampas", "Cerrado", "Pantanal", "Mata Atlântica", "Litoral"],
    locais: ["Rio Grande do Sul", "Santa Catarina", "Paraná", "São Paulo", "Minas Gerais"],
    porte: "Médio",
    habitat: "Campos abertos, pastos, praias, gramados e campos de futebol.",
    canto: "Grito agudo e repetido ('quero-quero!'), especialmente quando alguém se aproxima do ninho.",
    curiosidades: [
      "Possui esporões ósseos avermelhados nas dobras das asas para defender o ninho.",
      "Finge estar com a asa quebrada para atrair predadores para longe dos filhotes.",
      "É a ave-símbolo do estado do Rio Grande do Sul."
    ],
    skin: { corpo: "#8d99ae", asa: "#6c757d", barriga: "#f8f9fa", bico: "#e63946", crista: "#2b2d42", rabo: "#2b2d42" }
  },
  "garca-branca-grande": {
    cores: ["branco", "amarelo", "preto"],
    regioes: ["norte", "nordeste", "centro-oeste", "sudeste", "sul"],
    subregioes: ["Pantanal", "Amazônia", "Litoral", "Mata Atlântica"],
    locais: ["Todo o Brasil", "Mato Grosso", "Rio de Janeiro", "Pará", "Bahia"],
    porte: "Grande",
    habitat: "Lagoas, manguezais, rios, brejos e campos alagados.",
    canto: "Geralmente silenciosa; emite grasnados roucos em colônias de reprodução.",
    curiosidades: [
      "Voa com o pescoço elegantemente recolhido em formato de 'S'.",
      "Na época de reprodução, desenvolve longas penas ornamentais chamadas egretas.",
      "Fica imóvel na água rasa aguardando o momento exato de fisgar um peixe."
    ],
    skin: { corpo: "#ffffff", asa: "#e9ecef", barriga: "#f8f9fa", bico: "#ffb703", rabo: "#e9ecef" }
  },
  "colhereiro": {
    cores: ["rosa", "vermelho", "branco"],
    regioes: ["norte", "nordeste", "centro-oeste", "sudeste", "sul"],
    subregioes: ["Pantanal", "Litoral", "Amazônia"],
    locais: ["Mato Grosso", "Mato Grosso do Sul", "Paraná", "Rio de Janeiro", "Maranhão"],
    porte: "Grande",
    habitat: "Manguezais, lagoas costeiras, pântanos e rios rasos.",
    canto: "Sons baixos e guturais emitidos apenas nos ninhais.",
    curiosidades: [
      "Seu bico em forma de colher tem sensores táteis para detectar presas na água turva.",
      "A cor rosada da plumagem vem dos pigmentos dos crustáceos que ele consome.",
      "Alimenta-se balançando o bico de um lado para o outro dentro da água."
    ],
    skin: { corpo: "#ff758f", asa: "#ff4d6d", barriga: "#ffb3c1", bico: "#adb5bd", rabo: "#ff4d6d" }
  },
  "guara": {
    cores: ["vermelho", "preto"],
    regioes: ["norte", "nordeste", "sudeste"],
    subregioes: ["Litoral", "Amazônia"],
    locais: ["Maranhão", "Pará", "Amapá", "São Paulo", "Santa Catarina", "Bahia"],
    porte: "Médio",
    habitat: "Manguezais, estuários, ilhas costeiras e áreas alagadas salobras.",
    canto: "Grasnados baixos nos dormitórios coletivos em manguezais.",
    curiosidades: [
      "Nasce com plumagem marrom e cinza; só fica vermelho escarlate ao comer caranguejos.",
      "Seu nome vem do tupi e significa 'ave vermelha'.",
      "Forma bandos espetaculares que tingem o céu dos manguezais ao entardecer."
    ],
    skin: { corpo: "#d90429", asa: "#9b001c", barriga: "#ef233c", bico: "#2b2d42", rabo: "#111" }
  },
  "beija-flor-tesoura": {
    cores: ["verde", "azul", "roxo"],
    regioes: ["norte", "nordeste", "centro-oeste", "sudeste", "sul"],
    subregioes: ["Cerrado", "Mata Atlântica", "Caatinga", "Amazônia"],
    locais: ["São Paulo", "Minas Gerais", "Bahia", "Goiás", "Rio de Janeiro"],
    porte: "Pequeno",
    habitat: "Jardins, parques urbanos, bordas de mata e cerrados floridos.",
    canto: "Notas agudas, metálicas e rápidas enquanto defende flores.",
    curiosidades: [
      "É um dos maiores beija-flores comuns das cidades brasileiras, graças à longa cauda bifurcada.",
      "Muito territorialista, expulsa até aves bem maiores de seus bebedouros e flores.",
      "Pode bater as asas dezenas de vezes por segundo e voar para trás."
    ],
    skin: { corpo: "#2b9348", asa: "#1b4332", barriga: "#1d3557", bico: "#111", rabo: "#1d3557" }
  },
  "cardeal-de-topete-vermelho": {
    cores: ["vermelho", "cinza", "branco"],
    regioes: ["centro-oeste", "sudeste", "sul"],
    subregioes: ["Pampas", "Pantanal"],
    locais: ["Rio Grande do Sul", "Mato Grosso do Sul", "Paraná", "Santa Catarina"],
    porte: "Pequeno",
    habitat: "Campos com árvores esparsas, bordas de mata e parques.",
    canto: "Canto alegre, variado e assobiado, muito apreciado.",
    curiosidades: [
      "Seu topete vermelho vivo é erguido sempre que a ave está alerta.",
      "Machos e fêmeas têm plumagem praticamente idêntica.",
      "Os filhotes possuem o topete marrom-alaranjado antes de ficarem vermelhos."
    ],
    skin: { corpo: "#6c757d", asa: "#495057", barriga: "#ffffff", bico: "#adb5bd", crista: "#d90429", rabo: "#495057" }
  },
  "tie-sangue": {
    cores: ["vermelho", "preto"],
    regioes: ["nordeste", "sudeste", "sul"],
    subregioes: ["Mata Atlântica", "Litoral"],
    locais: ["Rio de Janeiro", "São Paulo", "Bahia", "Espírito Santo", "Santa Catarina"],
    porte: "Pequeno",
    habitat: "Restingas, bordas de Mata Atlântica, brejos e pomares.",
    canto: "Gorjeio curto e suave, além de chamados agudos em casal.",
    curiosidades: [
      "O macho tem um vermelho escarlate tão intenso que parece veludo.",
      "A fêmea é parda e discreta, ajudando a camuflar o ninho.",
      "É uma das aves mais emblemáticas da Mata Atlântica costeira."
    ],
    skin: { corpo: "#d00000", asa: "#111111", barriga: "#dc2f02", bico: "#e9ecef", rabo: "#111111" }
  },
  "saira-sete-cores": {
    cores: ["verde", "azul", "amarelo", "laranja", "preto"],
    regioes: ["nordeste", "sudeste", "sul"],
    subregioes: ["Mata Atlântica"],
    locais: ["São Paulo", "Rio de Janeiro", "Minas Gerais", "Espírito Santo", "Paraná", "Bahia"],
    porte: "Pequeno",
    habitat: "Florestas úmidas da Mata Atlântica e pomares próximos à mata.",
    canto: "Trinados finos e agudos enquanto procura frutas em bandos mistos.",
    curiosidades: [
      "Combina verde-limão, turquesa, azul-anil, preto e laranja em um único corpo pequeno.",
      "Costuma andar em bandos mistos com outras espécies de saíras nas copas.",
      "Adora bananas e frutas maduras em comedouros."
    ],
    skin: { corpo: "#38b000", asa: "#0077b6", barriga: "#00b4d8", bico: "#212529", rabo: "#ff7b00" }
  },
  "canario-da-terra": {
    cores: ["amarelo", "verde"],
    regioes: ["nordeste", "centro-oeste", "sudeste", "sul"],
    subregioes: ["Cerrado", "Caatinga", "Pampas", "Mata Atlântica"],
    locais: ["Todo o Brasil"],
    porte: "Pequeno",
    habitat: "Campos abertos, pastagens, fazendas e jardins.",
    canto: "Estalido vibrante e canto metálico muito característico.",
    curiosidades: [
      "O macho adulto exibe uma mancha alaranjada na testa.",
      "Gosta de fazer ninho em ocos de árvores, telhados ou ninhos abandonados de joão-de-barro.",
      "É nativo da América do Sul, diferente do canário-belga."
    ],
    skin: { corpo: "#ffbe0b", asa: "#9ef01a", barriga: "#ffd60a", bico: "#8d99ae", rabo: "#70e000" }
  },
  "sanhaco-cinzento": {
    cores: ["cinza", "azul", "verde"],
    regioes: ["nordeste", "centro-oeste", "sudeste", "sul"],
    subregioes: ["Mata Atlântica", "Cerrado", "Caatinga", "Pampas"],
    locais: ["São Paulo", "Minas Gerais", "Rio de Janeiro", "Bahia", "Paraná"],
    porte: "Pequeno",
    habitat: "Áreas arborizadas, quintais, praças e bordas de floresta.",
    canto: "Canto agudo e acelerado, muito comum nas manhãs urbanas.",
    curiosidades: [
      "Sua plumagem cinza-azulada tem reflexos esverdeados sob a luz do sol.",
      "Alimenta-se tanto de frutas quanto de flores e insetos.",
      "É uma das aves mais comuns em comedouros de frutas no Brasil."
    ],
    skin: { corpo: "#8ecae6", asa: "#219ebc", barriga: "#cfe8ef", bico: "#343a40", rabo: "#219ebc" }
  },
  "gralha-azul": {
    cores: ["azul", "preto"],
    regioes: ["sudeste", "sul"],
    subregioes: ["Mata Atlântica", "Pampas"],
    locais: ["Paraná", "Santa Catarina", "Rio Grande do Sul", "São Paulo", "Minas Gerais"],
    porte: "Médio",
    habitat: "Florestas com araucárias (pinheiro-do-paraná) e matas serranas.",
    canto: "Vocalização forte, variada e capaz de imitar outras aves.",
    curiosidades: [
      "É considerada a principal plantadora da araucária, pois enterra pinhões como reserva e esquece alguns.",
      "É a ave-símbolo oficial do estado do Paraná.",
      "Possui inteligência comparável à dos corvos."
    ],
    skin: { corpo: "#023e8a", asa: "#03045e", barriga: "#0077b6", bico: "#111", rabo: "#03045e" }
  },
  "anu-preto": {
    cores: ["preto"],
    regioes: ["norte", "nordeste", "centro-oeste", "sudeste", "sul"],
    subregioes: ["Cerrado", "Caatinga", "Pantanal", "Mata Atlântica", "Amazônia"],
    locais: ["Todo o Brasil"],
    porte: "Médio",
    habitat: "Pastos, capoeiras, brejos e terrenos abertos.",
    canto: "Assobio choroso e ascendente ('anu-u-u').",
    curiosidades: [
      "Várias fêmeas costumam botar ovos no mesmo ninho comunitário.",
      "Tem um bico alto e achatado lateralmente que o torna inconfundível.",
      "Gosta de seguir gado no pasto para capturar insetos espantados pelos bois."
    ],
    skin: { corpo: "#1f2421", asa: "#111315", barriga: "#2b2d42", bico: "#111315", rabo: "#111315" }
  },
  "pica-pau-do-campo": {
    cores: ["amarelo", "preto", "branco", "marrom"],
    regioes: ["nordeste", "centro-oeste", "sudeste", "sul"],
    subregioes: ["Cerrado", "Pampas", "Caatinga", "Mata Atlântica"],
    locais: ["Minas Gerais", "São Paulo", "Goiás", "Bahia", "Rio Grande do Sul"],
    porte: "Médio",
    habitat: "Campos abertos, pastagens e áreas com cupinzeiros.",
    canto: "Grasnado forte e sequencial que parece uma risada metálica.",
    curiosidades: [
      "Diferente da maioria dos pica-paus, passa muito tempo no chão procurando formigas e cupins.",
      "Escava ninhos em barrancos ou cupinzeiros terrestres.",
      "Tem o peito e as laterais da cabeça tingidos de amarelo vivo."
    ],
    skin: { corpo: "#2b2d42", asa: "#4a3f35", barriga: "#ffd166", bico: "#1d2022", rabo: "#2b2d42" }
  },
  "uirapuru-verdadeiro": {
    cores: ["marrom", "laranja"],
    regioes: ["norte"],
    subregioes: ["Amazônia"],
    locais: ["Amazonas", "Pará", "Acre", "Rondônia", "Amapá", "Roraima"],
    porte: "Pequeno",
    habitat: "Sub-bosque sombreado da Floresta Amazônica.",
    canto: "Melodia complexa, cristalina e flautada que silencia a mata ao redor.",
    curiosidades: [
      "É cercado de lendas amazônicas sobre sorte e amor devido ao seu canto hipnotizante.",
      "Cada indivíduo possui um repertório próprio de frases musicais.",
      "Apesar da fama imensa, é uma ave pequena e discreta de cor castanha."
    ],
    skin: { corpo: "#8d4925", asa: "#5c2e14", barriga: "#e07a5f", bico: "#3d281e", rabo: "#5c2e14" }
  },
  "pinguim-de-magalhaes": {
    cores: ["preto", "branco"],
    regioes: ["sul", "sudeste", "nordeste"],
    subregioes: ["Litoral"],
    locais: ["Rio Grande do Sul", "Santa Catarina", "Paraná", "São Paulo", "Rio de Janeiro", "Bahia"],
    porte: "Médio",
    habitat: "Águas costeiras e praias durante a migração de inverno.",
    canto: "Som grave que lembra o zurro de um jumento em suas colônias.",
    curiosidades: [
      "Migra da Patagônia até o litoral brasileiro no inverno seguindo correntes frias.",
      "Pode nadar a mais de 20 km/h em busca de cardumes de peixes.",
      "Não voa, mas suas asas funcionam como nadadeiras super eficientes."
    ],
    skin: { corpo: "#1d2022", asa: "#111315", barriga: "#ffffff", bico: "#343a40", rabo: "#111315" }
  },
  "soldadinho-do-araripe": {
    cores: ["branco", "preto", "vermelho"],
    regioes: ["nordeste"],
    subregioes: ["Caatinga", "Mata Atlântica"],
    locais: ["Ceará", "Chapada do Araripe", "Barbalha", "Crato", "Missão Velha"],
    porte: "Pequeno",
    habitat: "Matas úmidas próximas a nascentes na encosta da Chapada do Araripe.",
    canto: "Chamados curtos e vibrantes nas matas de nascente.",
    curiosidades: [
      "Só existe na Chapada do Araripe, no Ceará, sendo uma das aves mais raras do planeta.",
      "Foi descoberto pela ciência apenas em 1996.",
      "O macho tem um topete vermelho vivo que lembra um capacete de soldado."
    ],
    skin: { corpo: "#f8f9fa", asa: "#111315", barriga: "#ffffff", bico: "#343a40", crista: "#d90429", rabo: "#111315" }
  },
  "galo-de-campina": {
    cores: ["vermelho", "preto", "branco"],
    regioes: ["nordeste"],
    subregioes: ["Caatinga"],
    locais: ["Bahia", "Ceará", "Pernambuco", "Paraíba", "Rio Grande do Norte", "Piauí"],
    porte: "Pequeno",
    habitat: "Caatinga arbustiva, bordas de mata seca e áreas rurais do Nordeste.",
    canto: "Assobio forte, claro e repetitivo ao nascer do sol.",
    curiosidades: [
      "Sua cabeça vermelho-vivo contrasta com o peito branco e as costas escuras.",
      "É uma das aves mais queridas e simbólicas do sertão nordestino.",
      "Diferente do cardeal-do-sul, não possui topete pontudo na cabeça."
    ],
    skin: { corpo: "#2b2d42", asa: "#1a1c29", barriga: "#ffffff", bico: "#adb5bd", crista: "#d90429", rabo: "#1a1c29" }
  },
  "periquito-da-caatinga": {
    cores: ["verde", "laranja", "amarelo"],
    regioes: ["nordeste", "sudeste"],
    subregioes: ["Caatinga", "Cerrado"],
    locais: ["Bahia", "Pernambuco", "Ceará", "Piauí", "Paraíba", "Minas Gerais"],
    porte: "Pequeno",
    habitat: "Caatinga seca, áreas de cactos, juazeiros e mandacarus.",
    canto: "Tagarelice agitada e estridente quando voa em bandos.",
    curiosidades: [
      "Costuma escavar ninhos dentro de cupinzeiros arborícolas ativos.",
      "Adapta-se muito bem ao clima semiárido do sertão nordestino.",
      "Vive em bandos alegres e barulhentos em busca de sementes e frutos de cactos."
    ],
    skin: { corpo: "#38b000", asa: "#008000", barriga: "#9ef01a", bico: "#ced4da", anel: "#ff9f1c", rabo: "#008000" }
  },
  "concriz": {
    cores: ["laranja", "preto", "branco"],
    regioes: ["nordeste", "centro-oeste", "sudeste"],
    subregioes: ["Caatinga", "Cerrado"],
    locais: ["Bahia", "Pernambuco", "Ceará", "Paraíba", "Piauí", "Minas Gerais"],
    porte: "Pequeno",
    habitat: "Caatinga, cactáceas, bordas de mata seca e pomares.",
    canto: "Canto alto, melodioso e muito variado; também imita outras aves.",
    curiosidades: [
      "Também é conhecido como sofrê ou corrupião no Nordeste.",
      "É considerado uma das aves canoras mais bonitas do sertão.",
      "Suas cores vibrantes de laranja e preto o tornam inconfundível."
    ],
    skin: { corpo: "#fb5607", asa: "#111315", barriga: "#ff7b00", bico: "#212529", anel: "#4ea8de", rabo: "#111315" }
  },
  "asa-branca": {
    cores: ["cinza", "branco", "marrom"],
    regioes: ["nordeste", "centro-oeste", "sudeste", "sul"],
    subregioes: ["Caatinga", "Cerrado", "Mata Atlântica"],
    locais: ["Pernambuco", "Ceará", "Bahia", "Paraíba", "Minas Gerais", "São Paulo"],
    porte: "Médio",
    habitat: "Matas secas, caatingas, cerrados e áreas agrícolas.",
    canto: "Arrulho grave e melancólico ('tu-tu-tú-tu') que ecoa na caatinga.",
    curiosidades: [
      "Imortalizada na música clássica de Luiz Gonzaga e Humberto Teixeira.",
      "Possui uma faixa branca visível na borda das asas durante o voo.",
      "Migra em bandos quando a seca se torna intensa no sertão."
    ],
    skin: { corpo: "#7f6a65", asa: "#5c4b47", barriga: "#9e8a84", bico: "#343a40", anel: "#ffffff", rabo: "#493b38" }
  },
  "avoante": {
    cores: ["marrom", "cinza", "preto"],
    regioes: ["nordeste", "centro-oeste", "sudeste", "sul"],
    subregioes: ["Caatinga", "Cerrado", "Pampas"],
    locais: ["Ceará", "Bahia", "Piauí", "Paraíba", "Pernambuco", "São Paulo"],
    porte: "Pequeno",
    habitat: "Áreas abertas, lavouras, caatingas e pastagens.",
    canto: "Arrulho suave e rápido característico das pombas.",
    curiosidades: [
      "Forma colônias reprodutivas gigantescas chamadas 'pombais' no sertão nordestino.",
      "Pode voar centenas de quilômetros atrás de chuvas e sementes.",
      "Também é conhecida como arribaçã."
    ],
    skin: { corpo: "#a98467", asa: "#6c584c", barriga: "#ddb892", bico: "#212529", rabo: "#6c584c" }
  }
};

/* ================== EXTRAÇÃO DINÂMICA E CACHE DE SONS ================== */
const CORES_PALAVRAS = [
  { nome: "Azul", regex: /\b(azul|azuis|azulada|azulado|turquesa|anil|celeste)\b/i },
  { nome: "Vermelho", regex: /\b(vermelh[ao]s?|escarlate|carmim|rubr[ao])\b/i },
  { nome: "Amarelo", regex: /\b(amarel[ao]s?|dourad[ao]s?|ouro)\b/i },
  { nome: "Verde", regex: /\b(verdes?|esverdeada|esverdeado|oliva)\b/i },
  { nome: "Preto", regex: /\b(pret[ao]s?|negr[ao]s?|escur[ao]s?)\b/i },
  { nome: "Branco", regex: /\b(branc[ao]s?|alv[ao]s?)\b/i },
  { nome: "Cinza", regex: /\b(cinz[ao]s?|cinzent[ao]s?|acinzentad[ao]|pratead[ao])\b/i },
  { nome: "Marrom", regex: /\b(marrons?|marrom|castanh[ao]s?|pard[ao]s?|ferrugem|ruiv[ao])\b/i },
  { nome: "Laranja", regex: /\b(laranjas?|alaranjad[ao]s?)\b/i },
  { nome: "Rosa", regex: /\b(rosas?|rosad[ao]s?)\b/i }
];

const SUBREGIOES_PALAVRAS = [
  { nome: "Amazônia", regex: /\b(amaz[oô]nia|amaz[oô]nic[ao]|floresta amaz[oô]nica)\b/i },
  { nome: "Caatinga", regex: /\b(caatinga|sert[aã]o|semi[aá]rido)\b/i },
  { nome: "Cerrado", regex: /\b(cerrado|chapada|vereda)\b/i },
  { nome: "Pantanal", regex: /\b(pantanal|pantaneir[ao])\b/i },
  { nome: "Mata Atlântica", regex: /\b(mata atl[aâ]ntica|floresta atl[aâ]ntica|serra do mar)\b/i },
  { nome: "Pampas", regex: /\b(pampas?|campanha ga[uú]cha|campos sulinos)\b/i },
  { nome: "Litoral", regex: /\b(litoral|praia|costeir[ao]|manguezal|mangue|marinh[ao]|oce[aâ]nic[ao])\b/i }
];

const ESTADOS_PALAVRAS = [
  "Acre", "Alagoas", "Amapá", "Amazonas", "Bahia", "Ceará", "Distrito Federal",
  "Espírito Santo", "Goiás", "Maranhão", "Mato Grosso", "Mato Grosso do Sul",
  "Minas Gerais", "Pará", "Paraíba", "Paraná", "Pernambuco", "Piauí",
  "Rio de Janeiro", "Rio Grande do Norte", "Rio Grande do Sul", "Rondônia",
  "Roraima", "Santa Catarina", "São Paulo", "Sergipe", "Tocantins"
];

function corHexParaNome(nome) {
  const mapa = {
    azul: "#1d65c1", vermelho: "#c92a2a", amarelo: "#f5b700", verde: "#2b9348",
    preto: "#212529", branco: "#e9ecef", cinza: "#6c757d", marrom: "#8d5b4c",
    laranja: "#f77f00", rosa: "#ff758f"
  };
  return mapa[nome.toLowerCase()] || "#1d654c";
}

function gerarSkinPorCores(cores, titulo) {
  if (cores && cores.length) {
    const c1 = corHexParaNome(cores[0]);
    const c2 = cores[1] ? corHexParaNome(cores[1]) : "#e9ecef";
    return { corpo: c1, asa: "#2d3748", barriga: c2, bico: "#f59f00", rabo: c1 };
  }
  let h = 0;
  for (let i = 0; i < titulo.length; i++) h = (h * 31 + titulo.charCodeAt(i)) | 0;
  const hue = Math.abs(h) % 360;
  return {
    corpo: `hsl(${hue}, 58%, 42%)`,
    asa: `hsl(${hue}, 55%, 28%)`,
    barriga: `hsl(${(hue + 35) % 360}, 65%, 78%)`,
    bico: "#f59f00",
    rabo: `hsl(${hue}, 55%, 28%)`
  };
}

function obterMetadadosAve(pagina) {
  const titulo = typeof pagina === "string" ? pagina : pagina.title;
  const normFn = s => String(s).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
  const chave = normFn(titulo);
  const fixo = METADADOS_AVES[chave];
  if (fixo) {
    return {
      ...fixo,
      cores: fixo.cores.map(c => c[0].toUpperCase() + c.slice(1))
    };
  }

  const texto = typeof pagina === "string" ? "" : `${(pagina.categories || []).map(c => c.title).join(" | ")} | ${pagina.extract || ""}`;
  const cores = CORES_PALAVRAS.filter(c => c.regex.test(texto)).map(c => c.nome);
  const subregioes = SUBREGIOES_PALAVRAS.filter(s => s.regex.test(texto)).map(s => s.nome);
  const locais = ESTADOS_PALAVRAS.filter(e => new RegExp(`\\b${e}\\b`, "i").test(texto));

  const regioes = [];
  if (typeof REGEX_REGIOES !== "undefined") {
    for (const [reg, rx] of Object.entries(REGEX_REGIOES)) {
      if (rx.test(texto)) regioes.push(reg);
    }
  }

  let porte = "Médio";
  if (/\b(pequen[ao]|min[uú]scul[ao]|10\s*cm|12\s*cm|15\s*cm)\b/i.test(texto)) porte = "Pequeno";
  else if (/\b(grand[ea]|enorme|1\s*m|80\s*cm|90\s*cm|70\s*cm)\b/i.test(texto)) porte = "Grande";

  return {
    cores: cores.length ? cores : ["Variada"],
    regioes,
    subregioes,
    locais,
    porte,
    habitat: subregioes.length ? `Ambientes associados a ${subregioes.join(", ")}.` : "Diversos ambientes brasileiros.",
    canto: "Vocalização característica da espécie.",
    curiosidades: [
      `${titulo} faz parte da rica avifauna registrada no Brasil.`,
      pagina.extract ? pagina.extract.split(".")[0] + "." : `Espécie catalogada no guia Avifauna Brasil.`
    ],
    skin: gerarSkinPorCores(cores, titulo)
  };
}

/* ================== BUSCA DE SOM DA AVE (WIKIDATA P51 + COMMONS) ================== */
const cacheSons = new Map(); // chave: norm(titulo) -> { url, arquivo, licenca, fonte } | null

async function resolverArquivoCommons(nomeArquivo) {
  const limpo = nomeArquivo.replace(/^(File|Arquivo|Ficheiro):/i, "");
  const url = new URL("https://commons.wikimedia.org/w/api.php");
  url.searchParams.set("action", "query");
  url.searchParams.set("titles", "File:" + limpo);
  url.searchParams.set("prop", "imageinfo");
  url.searchParams.set("iiprop", "url|mime|extmetadata");
  url.searchParams.set("iiextmetadatafilter", "LicenseShortName|Artist");
  url.searchParams.set("format", "json");
  url.searchParams.set("formatversion", "2");
  url.searchParams.set("origin", "*");

  const resp = await fetch(url);
  if (!resp.ok) return null;
  const dados = await resp.json();
  const p = (dados.query?.pages || [])[0];
  const info = p?.imageinfo?.[0];
  if (!info?.url) return null;
  return {
    url: info.url,
    arquivo: limpo.replace(/_/g, " "),
    licenca: info.extmetadata?.LicenseShortName?.value || "Wikimedia Commons",
    fonte: info.descriptionurl || info.url
  };
}

async function buscarAudioNaWiki(titulo, dominio = "pt.wikipedia.org") {
  const url = new URL(`https://${dominio}/w/api.php`);
  url.searchParams.set("action", "query");
  url.searchParams.set("titles", titulo);
  url.searchParams.set("prop", "images");
  url.searchParams.set("imlimit", "50");
  url.searchParams.set("format", "json");
  url.searchParams.set("formatversion", "2");
  url.searchParams.set("origin", "*");

  const resp = await fetch(url);
  if (!resp.ok) return null;
  const dados = await resp.json();
  const imgs = dados.query?.pages?.[0]?.images || [];
  const audio = imgs.find(im => /\.(ogg|oga|mp3|wav|flac)$/i.test(im.title) && !/pronunc|spoken|pt-|en-/i.test(im.title));
  if (!audio) return null;
  return resolverArquivoCommons(audio.title);
}

async function buscarSomAve(titulo, wd = null) {
  const normFn = s => String(s).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
  const chave = normFn(titulo);
  if (cacheSons.has(chave)) return cacheSons.get(chave);

  let resultado = null;
  try {
    // 1) Wikidata P51 (áudio)
    if (wd?.audio) {
      resultado = await resolverArquivoCommons(wd.audio);
    }
    // 2) Arquivos de áudio no artigo da Wikipédia em português
    if (!resultado) {
      resultado = await buscarAudioNaWiki(titulo, "pt.wikipedia.org");
    }
    // 3) Fallback: artigo na Wikipédia em inglês (via sitelink do Wikidata)
    if (!resultado && wd?.enTitle) {
      resultado = await buscarAudioNaWiki(wd.enTitle, "en.wikipedia.org");
    }
  } catch (_) {
    resultado = null;
  }

  cacheSons.set(chave, resultado);
  return resultado;
}

