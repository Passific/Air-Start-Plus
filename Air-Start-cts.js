//-----------------------------
// Constantes du Jeux
var c_vitesse = [1, 1, 1.03, 1.06, 1.09, 1, 1];
var c_conso   = [1, 1, 0.97, 0.94, 0.91, 1, 1];

//-----------------------------
// Avions
var avion_t = {
    //-----------------------------
    // Avions de ligne
    //-----------------------------
    // Airbus
    "A300-600"  :{'moteur': 7000,'vitesse': 870,'carburant': 73000,'places':361,'id':2 },
    "A300-600ST":{'moteur': 8900,'vitesse': 780,'carburant': 68150,'places':600,'id':14},
    "A310-200"  :{'moteur': 5800,'vitesse': 850,'carburant': 61070,'places':279,'id':47},
    "A319"      :{'moteur': 2000,'vitesse': 827,'carburant': 29660,'places':142,'id':12},
    "A320"      :{'moteur': 2700,'vitesse': 827,'carburant': 29660,'places':180,'id':6 },
    "A321"      :{'moteur': 2900,'vitesse': 827,'carburant': 25920,'places':220,'id':48},
    "A330-200"  :{'moteur': 7200,'vitesse': 900,'carburant': 97530,'places':335,'id':49},
    "A330-300"  :{'moteur': 7806,'vitesse': 880,'carburant': 97170,'places':440,'id':19},
    "A340-200"  :{'moteur': 7800,'vitesse': 900,'carburant':155400,'places':300,'id':3 },
    "A340-500"  :{'moteur':10075,'vitesse': 918,'carburant':174800,'places':359,'id':17},
    "A340-600"  :{'moteur':11378,'vitesse': 918,'carburant':181900,'places':419,'id':18},
    "A350-900"  :{'moteur':10000,'vitesse':1040,'carburant':150000,'places':314,'id':40},
    "A380"      :{'moteur':17000,'vitesse':1040,'carburant':286000,'places':853,'id':9 },
    // Boeing
    "B717-200"  :{'moteur': 2300,'vitesse': 825,'carburant': 13890,'places':117,'id':8 },
    "B727"      :{'moteur': 7060,'vitesse': 915,'carburant': 31000,'places':189,'id':39},
    "B737-300"  :{'moteur': 2850,'vitesse': 908,'carburant': 23828,'places':126,'id':45},
    "B737-700"  :{'moteur': 1850,'vitesse': 850,'carburant': 26020,'places':146,'id':13},
    "B747-100"  :{'moteur':12000,'vitesse': 895,'carburant':183380,'places':505,'id':7 },
    "B747-700ER":{'moteur':11290,'vitesse': 913,'carburant':241140,'places':524,'id':16},
   "B747-400LCF":{'moteur':12500,'vitesse': 860,'carburant':216840,'places':800,'id':15},
    "B757-300"  :{'moteur': 4900,'vitesse': 848,'carburant': 43400,'places':289,'id':5 },
    "B767-200ER":{'moteur': 6300,'vitesse': 854,'carburant': 90916,'places':285,'id':46},
    "B777-200ER":{'moteur': 7700,'vitesse': 890,'carburant':171170,'places':440,'id':1 },
    "B777-200LR":{'moteur':10280,'vitesse': 905,'carburant':202290,'places':301,'id':44},
    "B787"      :{'moteur': 7300,'vitesse': 902,'carburant':126903,'places':330,'id':41},
    "MD-11"     :{'moteur':10900,'vitesse': 945,'carburant':146155,'places':410,'id':20},
    
    //-----------------------------
    // Supersoniques
    //-----------------------------
    // Aerospace
    "Concorde"  :{'moteur':25625,'vitesse':2250,'carburant':119500,'places':100,'id':10},
    // Tupolev
    "Tu-144"    :{'moteur':26180,'vitesse':2430,'carburant':112300,'places':140,'id':11},
    
    //-----------------------------
    // Jets privés
    //-----------------------------
    // Bombardier
    "Challenger 300"    :{'moteur':  850,'vitesse': 850,'carburant':  6775,'places':  8,'id':42},
    "Challenger 605"    :{'moteur': 1078,'vitesse': 850,'carburant':  9500,'places': 12,'id':21},
    "Challenger 850 ER" :{'moteur': 1620,'vitesse': 818,'carburant': 10650,'places': 15,'id':22},
    "Global 5000"       :{'moteur': 2067,'vitesse': 904,'carburant': 20325,'places': 17,'id':43},
    "Global Express XRS":{'moteur': 2014,'vitesse': 905,'carburant': 25382,'places': 19,'id':29},
    "Learjet 60XR"      :{'moteur':  750,'vitesse': 863,'carburant':  3811,'places':  8,'id':30},
    // Cessna
    "Cessna Citation CJ3"      :{'moteur': 590,'vitesse':773,'carburant':2650,'places': 6,'id':23},
    "Cessna Citation Sovereign":{'moteur':1140,'vitesse':848,'carburant':7270,'places':10,'id':31},
    "Cessna Citation X"        :{'moteur':1130,'vitesse':934,'carburant':7300,'places':12,'id':24},
    "Cessna Citation XLS"      :{'moteur':1040,'vitesse':815,'carburant':4400,'places': 9,'id':32},
    // Dassault
    "Falcon 20"         :{'moteur': 1084,'vitesse': 750,'carburant':  5203,'places': 12,'id':38},
    "Falcon 2000 EX"    :{'moteur': 1135,'vitesse': 850,'carburant':  9400,'places': 10,'id':34},
    "Falcon 50 EX"      :{'moteur': 1155,'vitesse': 797,'carburant':  8767,'places':  9,'id':26},
    "Falcon 7X"         :{'moteur': 1510,'vitesse': 922,'carburant': 18050,'places': 19,'id':25},
    "Falcon 900 EX"     :{'moteur': 1130,'vitesse': 797,'carburant': 11825,'places': 15,'id':33},
    // Gulfstream
    "Gulfstream 150"    :{'moteur':  933,'vitesse': 850,'carburant':  6000,'places':  8,'id':27},
    "Gulfstream 200"    :{'moteur': 1180,'vitesse': 850,'carburant':  8750,'places': 10,'id':28},
    "Gulfstream 450"    :{'moteur': 1808,'vitesse': 850,'carburant':  8061,'places': 16,'id':35},
    "Gulfstream 500"    :{'moteur': 1725,'vitesse': 904,'carburant': 20500,'places': 18,'id':36},
    "Gulfstream 550"    :{'moteur': 1735,'vitesse': 904,'carburant': 24000,'places': 19,'id':37},
}