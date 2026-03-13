let isLatin = false;
const latinWords = ["dormiō", "ego", "frāter", "hōra", "in", "īnsula", "labōrō", "legō", "meus", "nōn", "pater", "rīdeō", "servus", "tū", "turba", "ubi?", "via", "sum", "es", "est", "cadō", "cibus", "dūcō", "et", "fīlia", "fīlius", "forum", "habeō", "habitō", "intrō", "magnus", "pecūnia", "quaerō", "quoque", "salūtō", "sed", "spectō", "videō", "vīnum", "vocō", "Chapter", "ambulō", "amīcus", "ancilla", "clāmō", "clāmor", "cum", "currō", "dīcō", "equus", "festīnō", "gladius", "īnfēlīx", "laetus", "multus", "omnis", "per", "prīmus", "senātor", "urbs", "vincō", "ad", "adsum", "deus", "dominus", "dōnum", "laudō", "nōs", "parvus", "perīculum", "perterritus", "puella", "quod", "rēx", "Rōmānus", "subitō", "templum", "teneō", "tollō", "veniō", "vōs", "aqua", "audiō", "cupiō", "custōs", "dēbeō", "dō", "effugiō", "iuvenis", "maneō", "nēmō", "nōlō", "nox", "portō", "possum", "pulcher", "respondeō", "taceō", "timeō", "vēndō", "volō", "ā", "capiō", "diēs", "discēdō", "ē", "exspectō", "faciō", "iam", "in", "inquit", "marītus", "māter", "prope", "rogō", "sedeō", "stō", "tōtus", "trīstis", "tuus", "uxor", "appropinquō", "cūr?", "epistula", "homō", "ingēns", "īnsula", "mīles", "minimē", "nārrō", "nauta", "nunc", "ōlim", "pars", "puer", "pugnō", "rēs", "saepe", "silva", "tum", "vehementer", "agō", "bibō", "cōnspiciō", "dē", "domus", "eam", "eum", "gerō", "iaceō", "incendō", "mox", "nihil", "noster", "porta", "postquam", "prōcēdō", "senex", "surgō", "tandem", "trāns", "coepī", "cōnsūmō", "intellegō", "inter", "ita", "labor", "longus", "mūrus", "nōmen", "parō", "post", "praemium", "quamquam", "quī", "quōmodo?", "semper", "summus", "suus", "tamen", "vīvō", "amō", "amor", "cōgitō", "cōnficiō", "cōnsilium", "cōnstituō", "dīrus", "eōs", "fēmina", "mōns", "mors", "nec", "necō", "nesciō", "numquam", "ostendō", "tempus", "terreō", "verbum", "anteā", "bellum", "cēna", "cēterī", "cognōscō", "comes", "eō", "etiam", "ferōx", "hortus", "intereā", "iubeō", "lībertus", "multum", "nōnne?", "nūntiō", "putō", "sē", "simulatque", "vīlla", "ac", "auferō", "brevis", "cēlō", "hic", "ille", "imperium", "legō", "lūx", "ōrō", "prīnceps", "quō?", "rapiō", "rēgīna", "resistō", "reveniō", "sciō", "sentiō", "sī", "sine"]
const startLatin = () => {
    document.querySelector('.settingsPage > .title').textContent = 'Fraudator'
    document.querySelector('.impostorCount > .countLabel > span').textContent = 'Numerus Impostorum';
    document.querySelector('.playerTitle > span').textContent = 'Histriones';
    document.querySelector('.wordHolderCard').style.display = 'none';
    document.querySelector('.settingsButton').style.display = 'none';
    document.querySelector('.gamePage > .title').textContent = 'Histriones';

    for(let i in categoriesAllowed){
        categoriesAllowed[i] = false;
    }

    categoriesAllowed["Custom Word"] = true;

    for(let i = 0; i<latinWords.length; i++){
        words.push({
            word:latinWords[i],
            id:i
        });
    }

}


if(window.location.href.toLowerCase().includes('latin')){
    startLatin();
    isLatin = true;
}
