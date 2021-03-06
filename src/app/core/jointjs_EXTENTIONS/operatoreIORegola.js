/**
 *  Operatore IO Regola
 *  estende il nostro operatore
 * 
 */

operatoreIORegola = operatore.extend({
    
    molteplicita: "",
    sensorIDs: "",
    // Modifiche rispetto alla fase di modelling:
    // siccome sink e source sono trattate come Operatori,
    // abbiamo deciso di aggiungere anche a loro una descrizione
    // ed un hasParametro (che verrà settato a false)
    hasParametro: false,
    descrizione: "",


    /*
       Funzione che si occupa di costruire la parte dell'xml relativa all'operatoreIORegola in questione
    */
    esportaXML: function(){
        //Funzione interna per stampare l'XML relativo ai sensori
        var printSensorIDs = function(sensorIDs){
            var str="";
            var k;
            for(k=0; k<sensorIDs.length;k++){
                str=str+'<property name="sensorId_'+(k+1)+'" value="'+sensorIDs[k]+'"/>';
            }
            return str;
        };    
        var out ="";
        var ports = this.getPorts();

        for(var i = 0; i<ports.length; i++){
            if(ports[i].group == 'in'){
                if(i==0){
                    out=out+'<entity name="'+this.nome+'_' + this.id + '" class="package.Sink"/>';
                    out=out+printSensorIDs(this.sensorIDs);
                }
                out += '<port name="'+ports[i].id+'" class="package.IPort"/>';
            } else {
                if(i==0){
                    out=out+'<entity name="'+this.nome+'_' + this.id + '" class="package.Source"/>';
                    out=out+printSensorIDs(this.sensorIDs);
                }
                out += '<port name="'+ports[i].id+'" class="package.OPort"/>';
            }
        }
        out += ' </entity>';
        return out;
    },



    /*
        Generiamo l'elemento operatore che verrà renderizzato sul foglio di lavoro
        a partire dal JSON della listaOperatori
    */
    fromJSON: function(JSONtype, JSONoperatore, nome){
       var operatore = new joint.shapes.devs.Atomic({
            position: {
                x: 50 + Math.floor(Math.random()*(51)),
                y: 50 + Math.floor(Math.random()*(51))
            },
            inPorts: [],
            outPorts:  [],
            attrs:{
                '.body': {
                    'rx': 6,
                    'ry': 6
                },
            }
        });
        operatore.attr('.label/text', nome);
        // setto attributi relativi a joint js
        this.attributes = operatore.attributes;
        this.changed = operatore.changed;
        this.cid = operatore.cid;
        this.id = operatore.id;
        this.ports = operatore.ports;
        var ports = JSONtype.ports.items;
        var port = '';
        for(i = 0; i<ports.length; i++){
            port = new myPortObject();
            port.group = ports[i].group;
            port.attrs = ports[i].attrs;
            port.tipo = ports[i].tipo;
            port.id = ports[i].id;
            this.addPort(port);
        }

        //setto attributi relativi alle nostre funzionalità
        this.hasParametro = JSONoperatore.hasParam;
        this.descrizione = JSONoperatore.descrizione;
        this.nome = JSONoperatore.nome;
        
    },



    isOperatoreElementare: function(){
        return false;
    },



    isOperatoreComplesso: function(){
        return false;
    },



    isOperatoreIO: function(){
        return true;
    }
});
