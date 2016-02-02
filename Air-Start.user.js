// ==UserScript==
// @name        Air-Start+
// @namespace   air-start
// @icon        http://www.air-start.net/images/design/favicon.gif
// @include     http://www.air-start.net/compte.php*
// @updateURL   https://raw.githubusercontent.com/Passific/Air-Start-Plus/master/Air-Start.user.js
// @downloadURL https://raw.githubusercontent.com/Passific/Air-Start-Plus/master/Air-Start.user.js
// @version     0.30.4
// @description Calcule la faisabilitée des missions
// @author      Passific
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       GM_addStyle
// @require     http://ajax.googleapis.com/ajax/libs/jquery/1.11.3/jquery.min.js
// @require     https://raw.githubusercontent.com/Passific/Air-Start-Plus/master/Air-Start-cts-20150926.js
// @require     https://raw.githubusercontent.com/sizzlemctwizzle/GM_config/46277597ff1143a75512d28a5649496a7a01378f/gm_config.js
// @run-at      document-end
// ==/UserScript==

console.time("Air-Start-Plus");

/****************************
 *       Configuration      *
 ***************************/
GM_config.init(
{
    'id': 'Air-Start-Plus',
    'title':"Air-Start+ (v"+GM_info.script.version+") - Options",
    'fields':/* Fields object */ 
    {
        'WARNING_LEVEL': {
            'label': 'Marge moteur requise (h) :<br>',
            'section': ['Calcul de faisabilitée des missions', 'Basique'],
            'type': 'int',
            'min': 0,
            'default': 2
        },
        'SORT_BY': {
            'label': 'Tri des missions par (en priorité) :',
            'options': ['heure de départ', 'prix du contrat'],
            'type': 'radio',
            'default': 'heure de départ'
        },
        'ENABLE_ESCALE': {
            'type': 'checkbox',
            'label': 'Autoriser les escales',
            'default': true
        },
        'ESCALE_BONUS_H': {
            'label': 'Bonus donné aux escales lors du trie (en h) :<br>',
            'type': 'int',
            'min': 0,
            'default': 0
        },

        'TAB_DYN_TITLE': {
            'section': ['Propriétés d\'affichage', 'Général'],
            'type': 'checkbox',
            'label': 'Afficher le nombre d\'avion inactif dans le titre de la page',
            'default': true
        },
        'AUTO_REFRESH': {
            'type': 'checkbox',
            'label': 'Raffraichir automatiquement la page (toutes les h)',
            'default': true
        },
        'MAX_BEST': {
            'label': 'Nombre max de meilleure missions affichées :\n<br>(0 désactive la fonctionnalité)',
            'section': [null , 'Missions'],
            'type': 'int',
            'min': 0,
            'default': 8
        },
        'ENGIME_REVERSE': {
            'section': [null, 'Vos avions'],
            'type': 'checkbox',
            'label': 'Afficher le temps restant des moteurs',
            'default': true
        },
        'FIN_MAINTENANCE': {
            'type': 'checkbox',
            'label': 'Affiche l\'heure de fin des maintenances',
            'default': true
        },
        'REMOVE_THUMBNAIL': {
            'type': 'checkbox',
            'label': 'Supprime les miniatures des avions',
            'default': true
        },
        'DIRECT_LINK': {
            'type': 'checkbox',
            'label': 'Liens direct sur chaque avion vers ses missions',
            'default': true
        },
        'MISSING_PLANES': {
            'type': 'checkbox',
            'label': 'Affiche les avions configurés manquant (écrasés par ex.)',
            'default': true
        },

        'SAVE_BLOCKNOTE': {
            'section': ['Propriétés de sauvegarde', 'Attention, l\'utilisation des sauvegardes écrase le block note !' ],
            'type': 'checkbox',
            'label': 'Activer les fonctions de sauvegarde',
            'default': false
        },
        'SAVE_LOGIN_CHECK': {
            'type': 'checkbox',
            'label': 'Restaurer la sauvegarde régulièrement (si >12h)',
            'default': false
        },
        'AUTO_SAVE': {
            'type': 'checkbox',
            'label': 'Sauvegarder automatiquement après une modification',
            'default': false
        },
        'SILENT_SAVE': {
            'type': 'checkbox',
            'label': 'Sauvegarde automatique silencieuse',
            'default': true
        },
        'Sauvegarde': {
            'label': 'Sauvegarde manuelle\f ',
            'section': [null, 'Actions sur la sauvegarde'],
            'type': 'button',
            'click': function() { // Function to call when button is clicked
                save_blocknote(false);
            }
        },
        'Restauration': {
            'label': 'Restauration manuelle',
            'type': 'button',
            'click': function() { // Function to call when button is clicked
                read_blocknote();
            }
        },
        'Modifier': {
            'label': 'Modifier la sauvegarde',
            'type': 'button',
            'click': function() { // Function to call when button is clicked
                window.location.assign("compte.php?page=mp&tp=4");
            }
        }
    }
});

var WARNING_LEVEL    = GM_config.get('WARNING_LEVEL');
var SORT_BY          = GM_config.get('SORT_BY');
var ENABLE_ESCALE    = GM_config.get('ENABLE_ESCALE');
var ESCALE_BONUS_H   = GM_config.get('ESCALE_BONUS_H');
var TAB_DYN_TITLE    = GM_config.get('TAB_DYN_TITLE');
var AUTO_REFRESH     = GM_config.get('AUTO_REFRESH');
var MAX_BEST         = GM_config.get('MAX_BEST');
var ENGIME_REVERSE   = GM_config.get('ENGIME_REVERSE');
var FIN_MAINTENANCE  = GM_config.get('FIN_MAINTENANCE');
var REMOVE_THUMBNAIL = GM_config.get('REMOVE_THUMBNAIL');
var DIRECT_LINK      = GM_config.get('DIRECT_LINK');
var MISSING_PLANES   = GM_config.get('MISSING_PLANES');
var SAVE_BLOCKNOTE   = GM_config.get('SAVE_BLOCKNOTE');
var SAVE_LOGIN_CHECK = GM_config.get('SAVE_LOGIN_CHECK');
var AUTO_SAVE        = GM_config.get('AUTO_SAVE');
var SILENT_SAVE      = GM_config.get('SILENT_SAVE');

/****************************
 *        Functions         *
 ***************************/

/* Restore backup from the notepad */
function read_blocknote ()
{
    if (!SAVE_BLOCKNOTE) {
        alert("Sauvegarde désactivée dans les paramètres...");
        return false;
    }
    
    $.ajax({
        url: "compte.php?page=mp&tp=4",
        async: false
    })
    .done(function(data) {
        try {
           tmp = JSON.parse( $(data).find("#message_note").val() );
        } catch(e) {
            alert( "Sauvegarde illisible ou vide...\nL'avez-vous modifiée manuellement ?" );
            console.error(e);
            return false;
        }
        if (null != tmp) {
            mes_avions = tmp;
            /* Save local settings */
            GM_setValue('mes_avions', mes_avions);
            var this_time = new Date();
            GM_setValue('last_session', this_time.getTime());
            alert("Lecture de la sauvegarde OK !");
            return true;
        } else {
            alert( "Sauvegarde vide..." );
        }
        return false;
    })
    .fail(function() {
        alert( "Erreur lors de la lecture...\nVeuillez réessayer l'opération manuellement." );
        return false;
    });
}

/* Save backup in the notepad */
function save_blocknote(silent)
{
    if (!SAVE_BLOCKNOTE) {
        alert("Sauvegarde désactivée dans les paramètres...");
        return;
    }
    
    if (null == mes_avions) {
        alert("Rien à sauvegarder...");
        return;
    }
    $.ajax({
        url: "compte.php?page=mp&action=4&un=2&tp=4",
        data: {"message_note": JSON.stringify(mes_avions)},
        method: "POST"
    })
    .done(function(data) {
        if ($(data).text().match(/Vous venez de modifier votre Bloc-Notes avec succès !/)) {
            if (!silent) {
               alert("Sauvegarde OK !");
            }
        } else {
            alert( "Erreur inconnue lors de l'écriture..." );
        }
    })
    .fail(function() {
        alert( "Erreur lors de la sauvegarde...\nVeuillez réessayer l'opération manuellement." );
    });
}

function save_mes_avions(silent)
{
    GM_setValue('mes_avions', mes_avions);
    if (SAVE_BLOCKNOTE && AUTO_SAVE)
        save_blocknote(silent);
}

function create_avion(id, ref, type)
{
    var tmp_obj = {
        'ref' : ref,
        'type' : type,
        'm_type':1,
        'mission_tp':0,
        'mission_pays':0
    };
    mes_avions[id_aeroport][id] = tmp_obj;
    save_mes_avions(SILENT_SAVE);
}

function set_maintenance(avion)
{
    var tmp_date = new Date(new Date().getTime() + 2*3600000);
    mes_avions[id_aeroport][avion]['h_maint'] = (tmp_date.getHours()<10?"0":"") + tmp_date.getHours() + "h"
                                 + (tmp_date.getMinutes()<10?"0":"") + tmp_date.getMinutes();
    save_mes_avions(SILENT_SAVE);
}

// Source: http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
function getParameterByName(name)
{
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function select_todomission(tmp_id_avion, etat_moteur, etat_kero)
{
    /* This message should never appear now */
    if ( !(tmp_id_avion in mes_avions[id_aeroport]) ) {
        alert("L'avion n'est pas configuré !");
        return;
    }
    if (etat_moteur < 2) {
        alert("L'état des moteurs est insufisant !");
        return;
    }
    if (etat_kero < 500) {
        alert("L'état des réservoirs est insufisant !");
        return;
    }
    id_avion = tmp_id_avion;
    GM_setValue('id_avion', id_avion);
    $("#select_avion option[value='"+id_avion+"']").prop('selected', true);
    $('#lien_mission').attr('href', 'compte.php?page=vos-missions1&tp='+mes_avions[id_aeroport][id_avion]['mission_tp']
                                                           +'&id_pays='+mes_avions[id_aeroport][id_avion]['mission_pays']
                                                           +(null==etat_moteur?"":('&moteur='+etat_moteur))
                                                           +(null==etat_kero?"":('&kero='+etat_kero)) );
}

function check_missions()
{
    var info_missions = [];
    var best_shots = "<b>Premiers départs : ";
    var count = 0;
    var etat_moteur = getParameterByName("moteur");
    if ( (etat_moteur < 2) || (null === etat_moteur) )
        etat_moteur = 100;
    var etat_kero = getParameterByName("kero");
    if ( etat_kero < 0 || !etat_kero.match(/([0-9]+)/) )
        etat_kero = null;
    
    $('.Mpossibles').each(function () {
        //-----------------------------
        // Mission
        var passager   = parseInt($(this).text().match(/(passagers|marchandises) : ([0-9]+)/i) [2], 10);
        var distance   = parseInt($(this).text().match(/distance : ([0-9]+)/i)[1], 10);
        var equipageP  = parseInt($(this).text().match(/([0-9]+) pilotes/i)[1], 10);
        var equipageH  = parseInt($(this).text().match(/([0-9]+) hôtesse/i)[1], 10);
        var equipage   = equipageP + equipageH;
        var contrat    = parseInt($(this).text().match(/Contrat : ([0-9,]+)/i)[1].replace(/,/g, ''), 10);
        var mission_id = $(this).text().match(/Mission ([0-9]+)/i)[1];
        var tmp        = $(this).text().match(/départ : ([0-9]+)\/([0-9]+)\/([0-9]+) à ([0-9]+):([0-9]+)/i);
        var date_start = new Date(parseFloat(tmp[3]), parseFloat(tmp[2])-1, parseFloat(tmp[1]), parseFloat(tmp[4]), parseFloat(tmp[5]));
        var en_cours   = !(null === $(this).text().match(/Mission déjà en cours/));
        var escale_btn = $(this).find($("input[name='active_escale']"));
        var do_escale  = (0 != escale_btn.length) && ENABLE_ESCALE;
        //-----------------------------
        // Calculs
        var vitesse  = Math.ceil(avion_t[mes_avions[id_aeroport][id_avion]['type']]['vitesse'] * c_vitesse[ mes_avions[id_aeroport][id_avion]['m_type'] ]);
        var moteur   = Math.ceil(avion_t[mes_avions[id_aeroport][id_avion]['type']]['moteur' ] * c_conso  [ mes_avions[id_aeroport][id_avion]['m_type'] ]);
        var heure    = distance / vitesse;
        var aller    = moteur + 3 * (passager + equipage);
        var retour   = do_escale? 0 : ((moteur / 2) + 1.5 * (passager + equipage)); /* (moteur + 3 * (Math.floor(passager*0.9) + equipage)) */
        var conso    = Math.ceil(heure) * (aller + retour);
        var restant  = Math.floor( (etat_kero===null?avion_t[mes_avions[id_aeroport][id_avion]['type']]['carburant']:etat_kero) - conso);
        var trestant = Math.floor(restant/aller)
        var mo_marge = (etat_moteur - Math.ceil(heure)*2);
        if (do_escale) {
            contrat += contrat/4; /*TODO: approximatif */
            date_start = (new Date(date_start - (ESCALE_BONUS_H*3600000) ));
        }
        //-----------------------------
        // Affichage
        var titre = $(this).find('.Mpossibles1 h4');
        // Mission trop courte...
        if ( (distance < 400) || (etat_moteur < Math.ceil(heure)*2) ) {
            titre.html("Mission "+mission_id);
            titre.css('color', 'red');
        }
        else if ((conso < (etat_kero===null?avion_t[mes_avions[id_aeroport][id_avion]['type']]['carburant']:etat_kero))
                 && (passager <= avion_t[mes_avions[id_aeroport][id_avion]['type']]['places'])) {
            // 1 - warning
            // 2 - OK
            if ((trestant >= WARNING_LEVEL) && (mo_marge >= WARNING_LEVEL)) {
                titre.css('color', 'green');
                info_missions.push([2, contrat, mission_id, date_start, en_cours, do_escale]);
                titre.html("Mission "+mission_id+" (temps : "+Math.ceil(heure)*2+"h + "+(trestant>mo_marge?mo_marge:trestant)+"h de marge)");
                if (do_escale)
                    escale_btn.prop('checked', true);
            } else {
                titre.css('color', 'orange');
                info_missions.push([1, contrat, mission_id, date_start, en_cours, do_escale]);
                titre.html("Mission "+mission_id+" (temps : "+Math.ceil(heure)*2+"h + "+(trestant>mo_marge?mo_marge:trestant)+"h de marge)");
            }
        } else {
            titre.html("Mission "+mission_id);
            titre.css('color', 'red');
        }
        titre.attr('id', mission_id);
    });
    
    info_missions.sort(function(a,b) {
        var ret = 0;
        if ("heure de départ" == SORT_BY) {
            if (a[3]>b[3])
                ret = 1;
            else if (a[3]<b[3])
                ret = -1;
             // Si dates égales, par valeur du contrat
            else
                ret = -(parseFloat(a[1]) - parseFloat(b[1]));
        } else if ("prix du contrat" === SORT_BY) {
            best_shots = "<b>Meilleurs contrats : ";
            ret = -(parseFloat(a[1]) - parseFloat(b[1]));
        }
        return ret;
    } );
    
    if(0 == MAX_BEST) {return;}
    for (bests_mission in info_missions) {
        if (count < MAX_BEST) {
            // Mission impossible...
            //if(0 == info_missions[bests_mission][0])
            //    continue;
            // Mission OK
            if (2 == info_missions[bests_mission][0]) {
                best_shots += "<a class=\"lien\" "+(info_missions[bests_mission][5]?"style=\"color:MidnightBlue\" ":"")+"href='#"+info_missions[bests_mission][2]+"'>"
                      +(info_missions[bests_mission][4]?"<del>":"")+
                         info_missions[bests_mission][2]
                      +(info_missions[bests_mission][4]?"</del>":"")+
                    "</a>"+(++count!=MAX_BEST?', ':'');
            }
        } else {
            break;
        }
    }
    if (0 == count)
        best_shots+="aucune possible...";
    else if (MAX_BEST > count)
        best_shots+="...";
    best_shots+="</b>";
    if ($("#best_missions").length)
        $("#best_missions").html(best_shots);
    else
        $('.Mpossibles:first').before("<br><div id='best_missions'>"+best_shots+"</div>");
    GM_addStyle (".Mpossibles1 h4:before{display:block;content:' ';margin-top:-60px;height:60px;visibility:hidden;}");
}

/* Padding on top for custom shortcuts */
GM_addStyle ("body{padding-top:24px;}" +
             "a{cursor:pointer}" +
             "#mytable{width:950px;position:fixed;top:0px;left:50%;margin-left:-475px;padding-top:5px;padding-bottom:2px;" +
                      "background-image:url(../images/design/fond.gif);}");


/****************************
 * Variables initialization *
 ***************************/
var page = getParameterByName("page");
var content = document.documentElement.innerHTML;
//var id_pseudo = document.cookie.match(/id_pseudo=(\d+);/)[1];
var id_avion     = GM_getValue('id_avion', "1107303");
var id_aeroport  = GM_getValue('id_aeroport', "0"); //13778
var mes_avions   = GM_getValue('mes_avions', null);
var mes_aeroport = GM_getValue('mes_aeroport', null);


/****************************
 *       Main program       *
 ***************************/

/* Test if not connected */
if (content.match("vous n'êtes pas connecté")) {
    throw new Error("Stopped JavaScript.");
}

/* If no local copy, retreive the backup in the notepad */
if (null == mes_avions && SAVE_BLOCKNOTE) {
    read_blocknote();

/* If local copy OK, check its age */
} else if (SAVE_BLOCKNOTE && SAVE_LOGIN_CHECK) {
    var last_time = GM_getValue('last_session', 0);
    var this_time = new Date();
    if ( (this_time.getTime() - last_time) > 12*3600*1000 ) {
        if (confirm("Voulez-vous charger la sauvegarde ?")) {
            read_blocknote();
            /* Reset current airport */
            if (null != mes_aeroport) {
                window.location.assign("compte.php?page=aeroport");
            }
        } else {
            GM_setValue('last_session', this_time.getTime());
        }
    } else {
       GM_setValue('last_session', this_time.getTime());
    }
}

/* Otherwise, initiate a clean start */
if (null == mes_avions) {
    if("vos-avions" != page) {
        /* Goto planes */
        window.location.assign("compte.php?page=vos-avions");
    }
    mes_avions = {};
}
if (undefined == mes_avions[id_aeroport]) {
    if("vos-avions" != page) {
        /* Goto planes */
        window.location.assign("compte.php?page=vos-avions");
    }
    mes_avions[id_aeroport] = {};
    $(".vosavions:first tr").each(function(index) {
        var tableData = $(this).find('td');
        if (tableData.length > 1 && index != 0) {
            var tmp_avion = tableData[1].innerHTML.match(/av=([0-9]+)/)[1];
            create_avion(tmp_avion, tableData[3].textContent, tableData[1].textContent);
        }
    });
    save_mes_avions(SILENT_SAVE);
}


//Check if plane still exist + counting
var plane_count_default = 0, last = 0;
for (last in mes_avions[id_aeroport])plane_count_default++;

$("input:first").focus();

var menu_bar = '<table id="mytable"><tbody id="last_mission"><tr>' +
        '<td><a class="lien" id="gm_option">Options</a></td>';

if (null != mes_aeroport) {
    menu_bar += '<td><form id="form_aeroport" action="compte.php?page=action&amp;action=15" method="post"><select id="select_aeroport" name="id_aeroport">';
    
    for (key in mes_aeroport) {
        menu_bar += '<option value="'+key+'" '+(key==id_aeroport?"selected":"")+'>'+mes_aeroport[key]+'</option>';
    }
    
    menu_bar += '</select></form></td>';
}

/* if at least one plane is present */
if (0 != plane_count_default) {
    if ( !(id_avion in mes_avions[id_aeroport]) ) {
        id_avion = last;
    }
    menu_bar += '<td><a id="lien_mission" class="lien" href="compte.php?page=vos-missions1&tp='+mes_avions[id_aeroport][id_avion]['mission_tp']
                                                                          +'&id_pays='+mes_avions[id_aeroport][id_avion]['mission_pays']
                                                                          +'">Mission</a></td>';
    /* Warning for escales ? */
    //GM_setValue('argent', parseInt(content.match(/votre Argent : ([0-9, -]+)/i)[1].replace(/,/g, ''), 10));
}

menu_bar += '<td><a class="lien" href="compte.php?page=carnet-vol">Carnet de vol</a></td>' +
        '<td><a class="lien" href="compte.php?page=tableau-affichage">Tableau d\'affichage</a></td>' +
        '<td><a class="lien" href="compte.php?page=vos-avions">Avions</a></td>';

menu_bar += '<td><form><select id="select_avion">';
var nb_avions = 0;
for (key in mes_avions[id_aeroport]) {
    nb_avions++;
    menu_bar += '<option value="'+key+'">'+mes_avions[id_aeroport][key]['type']+' - '+mes_avions[id_aeroport][key]['ref']+'</option>';
}
menu_bar += '</select></form></td>'
          + '</tr><tr><td colspan="7" id="best_missions"></td></tr></tbody></table>';

$('body').append(menu_bar);

$("#gm_option").on("click", function() {GM_config.open();});

$("#select_avion option[value='"+id_avion+"']").prop('selected', true);
$('#select_avion').change(function()
{
    select_todomission($('#select_avion').val());
    if (page == 'vos-missions1')
        check_missions();
});

if (null != mes_aeroport) {
    $('#select_aeroport').change(function()
    {
        GM_setValue('next_id_aeroport', $('#select_aeroport').val() );
        $('#form_aeroport').trigger("submit");
    });
}

var nb_inactive_avion = 0;

switch (page) {
case "vos-avions":
    GM_addStyle(".vosavions tr:not(:first-child):hover{font-weight:bold;}" +
       ".vosavions7{font-weight:normal;!important}" +
       ".vosavions img{max-height:39px;}");
    
    if (SAVE_BLOCKNOTE && !AUTO_SAVE ) {
        $(".vosavions:first").after('<br><span><a id="save_avion" class="lien">Sauvegarde</a> / <a id="restore_avion" class="lien">Restauration</a> manuelle des avions.<br>' +
                                     '<a href="compte.php?page=mp&tp=4" class="lien">Modifier</a> la sauvegarde.</span><br>');
        $("#save_avion").on("click", function() {save_blocknote(false);} );
        $("#restore_avion").on("click", function() {read_blocknote();} );
    }
    
    var etat_moteur,etat_kero;
    var current_planes = [], plane_count = 0;
    $(".vosavions:first tr").each(function(index) {
        var tableData = $(this).find('td');
        if (tableData.length > 1 && index != 0) {
            var tmp_avion = tableData[1].innerHTML.match(/av=([0-9]+)/)[1];
            plane_count++;
            current_planes.push(tmp_avion);
            if (tableData.length == 10) {
                var isInactive = 0;
                
                /* Update if plane just bought */
                if (null == mes_avions[id_aeroport][tmp_avion]) {
                    tmp_plane = GM_getValue('avion_to_buy', null);
                    if (null != tmp_plane) {
                        if (tableData[1].textContent == tmp_plane[1]) {
                            if (null != mes_avions[id_aeroport][tmp_plane[0]]) {
                                /* Rename the remplaced plane */
                                mes_avions[id_aeroport][tmp_avion] = mes_avions[id_aeroport][ tmp_plane[0] ];
                                delete mes_avions[id_aeroport][ tmp_plane[0] ];
                                mes_avions[id_aeroport][tmp_avion]['ref'] = tableData[3].textContent;
                                if (mes_avions[id_aeroport][tmp_avion]['m_type'] <= 4)
                                    mes_avions[id_aeroport][tmp_avion]['m_type'] = 1;
                                save_mes_avions(SILENT_SAVE);
                                GM_setValue('avion_to_buy', null);
                                alert("Le "+tmp_plane[1]+" a été remplacé !");
                            } else {
                                if (confirm("L'avion est introuvable, voulez-vous charger la sauvegarde ?"))
                                    read_blocknote();
                            }
                        } else {
                           create_avion(tmp_avion, tableData[3].textContent, tableData[1].textContent);
                       }
                    } else {
                        create_avion(tmp_avion, tableData[3].textContent, tableData[1].textContent);
                    }
                }
                
                if (tableData[2].innerHTML === "I") {
                    tableData[2].innerHTML = "<b><font color='red'>I</font></b>";
                    nb_inactive_avion++;
                    isInactive = 1;
                    if (null != mes_avions[id_aeroport][tmp_avion]['h_maint'] && FIN_MAINTENANCE) {
                        delete mes_avions[id_aeroport][tmp_avion]['h_maint'];
                        save_mes_avions(SILENT_SAVE);
                    }
                }
                etat_moteur = tableData[9].innerHTML.match(/([0-9,]+) \/ ([0-9,]+)/);
                etat_kero = tableData[5].innerHTML.match(/([0-9,]+) litre/i)[1].replace(/,/g, '');
                
                if (DIRECT_LINK && (mes_avions[id_aeroport][tmp_avion] != null) )
                    tableData[3].innerHTML = "<a class='lien select_todomission' data_id='"+tmp_avion
                                                                             +"' data_mo='"+(etat_moteur[2]-etat_moteur[1])
                                                                             +"' data_kero='"+etat_kero
                                            +"' href='compte.php?page=vos-missions1&tp="+mes_avions[id_aeroport][tmp_avion]['mission_tp']
                                                                               +"&id_pays="+mes_avions[id_aeroport][tmp_avion]['mission_pays']
                                                                               +"&moteur="+(etat_moteur[2]-etat_moteur[1])
                                                                               +"&kero="+etat_kero+"'>"+tableData[3].innerHTML+"</a>";
                else
                    tableData[3].innerHTML = "<a class='lien select_todomission' data_id='"+tmp_avion
                                                                             +"' data_mo='"+(etat_moteur[2]-etat_moteur[1])
                                                                             +"' data_kero='"+etat_kero+"'>"+tableData[3].innerHTML+"</a>";
                
                if (ENGIME_REVERSE) {
                    tableData[9].innerHTML = tableData[9].innerHTML.replace(/([0-9,]+) \/ ([0-9,]+)/, ""+(etat_moteur[2]-etat_moteur[1])+" / $2");
                    //if (null != tableData[9].innerHTML.match('Changer !!') || 1) {
                        if (1 != mes_avions[id_aeroport][tmp_avion]['m_type']) {
                            if (null != tableData[9].innerHTML.match('Changer !!')) {
                                tableData[9].innerHTML = tableData[9].innerHTML.replace('Changer !!', '');
                                tableData[9].innerHTML += ' <form action="compte.php?page=action&amp;action=9&amp;id_avion='+tmp_avion+'" method="post">' +
                                                              '<input type="hidden" name="id_moteur" value="'+mes_avions[id_aeroport][tmp_avion]['m_type']+'">' +
                                                              '<input value="Moteur '+mes_avions[id_aeroport][tmp_avion]['m_type']+'" type="submit"></form>';
                            }
                        } else if (isInactive) {
                            tableData[9].innerHTML += ' <form action="compte.php?page=action&amp;action=9&amp;id_avion='+tmp_avion+'" method="post">' +
                                                          '<input type="hidden" name="id_moteur" value="'+4+'">' +
                                                          '<input value="Cheat '+4+'" type="submit"></form>';
                        }
                    //}
                }
            } else {
                if (tableData[2].innerHTML === "I") {
                    if (tableData[4].innerHTML.match(/Cliquer ici/) != null) {
                        tableData[2].innerHTML = "<font color='orange'>I (M)</font>";
                        nb_inactive_avion++;
                    } else if (tableData[4].innerHTML.match(/500,000 km/) != null) {
                        tableData[2].innerHTML = "<b><font color='red'>HS</font></b>";
                    } else {
                        tableData[2].innerHTML = "M";
                        if (null != mes_avions[id_aeroport][tmp_avion]['h_maint'] && FIN_MAINTENANCE) {
                            tableData[4].innerHTML = "Fin de maintenance à <b>" + mes_avions[id_aeroport][tmp_avion]['h_maint'] + "</b>";
                        }
                    }
                } else if (tableData[4].innerHTML.match(/Cliquer ici/) != null) {
                    tableData[4].innerHTML = "L'avion aura besoin d'une maintenance afin de pouvoir faire une mission";
                }
                tableData[3].innerHTML = "<a class='lien select_todomission' data_id='"+tmp_avion+"'>"+tableData[3].innerHTML+"</a>";
            }
        }
        if (REMOVE_THUMBNAIL)
            tableData[0].remove();
    });
    
    if (MISSING_PLANES) {
        if (plane_count < plane_count_default) {
            for (avion in mes_avions[id_aeroport]) {
                if (current_planes.indexOf(avion) < 0 ) {
                    $(".vosavions:first").append(
                        "<tr>" +
                            "<td class='vosavions7' colspan='9'>" +
                               "<b>"+mes_avions[id_aeroport][avion]['type']+" - "+mes_avions[id_aeroport][avion]['ref']+"</b>" +
                               " n'est plus disponible, vous devez l'acheter - " +
                               "<a href='compte.php?page=acheter2&action=8&av="+avion_t[ mes_avions[id_aeroport][avion]['type'] ]['id']
                                                               +"' data_id='"+avion
                                                               +"' data_type='"+mes_avions[id_aeroport][avion]['type']
                                                               +"' class='lien missing_plane'>Cliquez ici</a> " +
                               "(ou <a class='lien delete_plane' data_id='"+avion+"'>Supprimer</a>)" +
                               "</td></tr>\n");
                }
            }
        } else {
            GM_setValue('avion_to_buy', null );
        }
        $(".missing_plane").on("click", function() {
            /* Plane ID, Plane Type */
            GM_setValue('avion_to_buy', [$(this).attr("data_id"), $(this).attr("data_type")] );
        });
        $(".delete_plane").on("click", function() {
            if (null != mes_avions[id_aeroport][ $(this).attr("data_id") ])
            if (confirm("Voulez-vous vraiment supprimer cet avion ?")) {
                delete mes_avions[id_aeroport][ $(this).attr("data_id") ];
                save_mes_avions(SILENT_SAVE);
            }
        });
    }
    
    $(".select_todomission").on("click", function() {
        select_todomission($(this).attr("data_id"), $(this).attr("data_mo"), $(this).attr("data_kero"));
    });
    if (AUTO_REFRESH){
        window.setTimeout(function() {
            GM_setValue('is_refresh', true);
            GM_setValue('last_nb_inactive_avion', nb_inactive_avion);
            window.location.reload();
        }, (3600000 - (new Date().getTime()-70000) % 3600000) ); //time until next hour and 1min10sec
    }
    break;
    
case 'vos-missions1':
    check_missions();
    $('[name="id_avion"] > option[value="'+id_avion+'"]').attr('selected', true);
    
    var pays = $("select[name='id_pays']").val();
    var tp = getParameterByName("tp");
    var pays_count = 0;
    for (key in mes_avions[id_aeroport]) {
        if (pays == mes_avions[id_aeroport][key]['mission_pays'])
            pays_count++;
    }
    $("#haut").before('<a class="lien" id="mission_for_plane" data_tp="'+tp+'" data_pays="'+pays+'">Enregistrer ce pays pour l\'avion courant</a> ('+pays_count+' actuellement)<br><br>')
    $("#mission_for_plane").on("click", function() {
        if (null != $(this).attr("data_tp") && null != $(this).attr("data_pays")) {
           if (confirm("Vous êtes sur de vouloir faire ce changment ?")) {
               mes_avions[id_aeroport][id_avion]['mission_tp'] = $(this).attr("data_tp");
               mes_avions[id_aeroport][id_avion]['mission_pays'] = $(this).attr("data_pays");
               save_mes_avions(SILENT_SAVE);
           }
        }
    });
    break;
    
case 'tableau-affichage':
    $('.Taffichage:first').before(($('.Taffichage:first tr').length-1)+'/'+nb_avions+' en mission');
    break;
    
case 'action':
    var action = getParameterByName("action");
    var avion = getParameterByName("id_avion");
    
    /* Changement d'aeroport */
    if (15 == action) {
        if ( content.match("Vous venez de vous connecter avec succ") ) {
            var tmp = GM_getValue('next_id_aeroport', null);
            if (null != tmp) {
                id_aeroport = tmp;
                GM_setValue('id_aeroport', id_aeroport);
            }
        }
    }
    
    else if(null == mes_avions[id_aeroport][avion])
        break;
    
    /* Choix des moteurs */
    else if (8 == action) {
        GM_setValue('moteur_to_buy', $('select:first').val());
        $('select:first').change(function(){GM_setValue('moteur_to_buy', $(this).val() );});
    }
    
    /* Changement des moteurs */
    else if (9 == action) {
        if ( content.match("L'avion va bien recevoir ses nouveaux moteurs") ) {
            var tmp = GM_getValue('moteur_to_buy', null);
            if (null != tmp) {
                mes_avions[id_aeroport][avion]['m_type'] = tmp;
                save_mes_avions(SILENT_SAVE);
            }
            if (FIN_MAINTENANCE) {
                set_maintenance(avion);
            }
        }
        GM_setValue('moteur_to_buy', null);
    } else if (null != GM_getValue('moteur_to_buy', null)) {
        GM_setValue('moteur_to_buy', null);
    }
    
    /* Maintenance des 100,000km */
    else if (30 == action && FIN_MAINTENANCE) {
        if ( content.match("Votre avion est maintenant en maintenance") ) {
            set_maintenance(avion);
        }
    }
    break;
    
case 'boutique1':
    var affiche = getParameterByName("affiche");
    /* Remplir vos citernes de kérosène */
    if (5 == affiche) {
        var citerne = content.match(/<strong>([0-9,]+)<\/strong> \/ <strong>([0-9,]+)<\/strong> litres/);
        var citerne_lvl = Math.round((parseInt(citerne[1].replace(/,/g, ''))*100)/parseInt(citerne[2].replace(/,/g, '')));
        $('img:first').after('<br><progress max="100" value="'+citerne_lvl+'"></progress> ('+citerne_lvl+'%)');
        
        $('input[name="cq"]').val(parseInt(content.match(/Place.*>([0-9,]+)</i)[1].replace(/,/g, ''), 10));
    }
    break;
    
case 'mp':
    var action = getParameterByName("action");
    var tp = getParameterByName("tp");
    if (4 == action && 4 == tp && SAVE_BLOCKNOTE) {
        if (confirm("Voulez-vous mettre à jour la configuration courante\nà partir de la sauvegarde ?")) {
            read_blocknote();
        }
    } else if ("" == action && 4 == tp && SAVE_BLOCKNOTE) {
        if (!confirm("Attention !\nLa modification de la sauvegarde peut corrompre son utilisation.\nNe continuez que si vous savez ce que vous faites.")) {
            window.location.assign("compte.php?page=vos-avions");
        }
    }
    break;
    
case 'aeroport':
    if (undefined != $('select[name="id_aeroport"]').val()) {
        if (null == mes_aeroport) {
            mes_aeroport = {};
        }
        $('select[name="id_aeroport"] option').each(function(name, val){
            mes_aeroport[val.value] = val.text;
            
            /* First new airport */
            if ("0" == id_aeroport) {
                id_aeroport = val.value;
                mes_avions[id_aeroport] = mes_avions["0"];
                delete mes_avions["0"];
                save_mes_avions(SILENT_SAVE);
            }
        });
        
        GM_setValue('mes_aeroport', mes_aeroport);
        
        id_aeroport = $('select[name="id_aeroport"]').val();
        GM_setValue('id_aeroport', id_aeroport);
        
        
        $('select[name="id_aeroport"]').change(function(){GM_setValue('next_id_aeroport', $(this).val() );});
    }
    break;
}

if (0 != nb_inactive_avion && TAB_DYN_TITLE) {
    if (0 == GM_getValue('last_nb_inactive_avion', 1) && AUTO_REFRESH && GM_getValue('is_refresh', false) ) {
        GM_setValue('last_nb_inactive_avion', nb_inactive_avion);
        window.location.reload();
    }
    document.title = "(" + nb_inactive_avion + ") " + document.title;
}

GM_setValue('is_refresh', false);

console.timeEnd("Air-Start-Plus");