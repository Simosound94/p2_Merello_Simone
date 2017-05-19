'use strict';

angular.module('myApp').service('FoglioDiLavoroService', function(ValidityCheckerService, $window){
    this.paper='';
    
    // this.grafo='';
    this.nomeFoglioDiLavoro='';
    /* TODO: togliere se implementiamo solo regola */
    this.operatoreComplesso='';

    this.creaFoglioDiLavoroRegola = function(idElement, validateConnectionFnc){
        // this.grafo = new joint.dia.Graph;
        var grafo= new joint.dia.Graph;

        /*
        E' necessario creare un nuovo div altrimenti
        al momento della cancellazione il div viene rimosso
        */
        // var divPaper = document.createElement('div');
        // var element = document.getElementById(idElement);
        // element.appendChild(divPaper);

       

        var element= angular.element( document.querySelector(idElement));
        var divPaper = angular.element('<div></div>');
        $( "#"+idElement ).append(divPaper);
        var element = document.getElementById(idElement);
        

        this.paper = new joint.dia.Paper({  
          el: divPaper,
          width: element.clientWidth,
          height: element.clientHeight,
          gridSize: 20,
          drawGrid: 'fixedDot',
          model: grafo,
          snapLinks: true,
          linkPinning: false,
          embeddingMode: true,
          highlighting: {
              'default': {
                  name: 'stroke',
                  options: {
                      padding: 6
                  }
              },
              'embedding': {
                  name: 'addClass',
                  options: {
                      className: 'highlighted-parent'
                  }
              }
          },
          validateEmbedding: function(childView, parentView) {
              return parentView.model instanceof joint.shapes.devs.Coupled;
          },
          /*
          validateConnection: function(sourceView, sourceMagnet, targetView, targetMagnet) {
              return sourceMagnet != targetMagnet;
          }
          */
          //validateConnection: validateConnectionFnc,
            validateConnection: ValidityCheckerService.correttezzaLink
        });        
         this.paper.on('link:connect', function(evt, cellView, magnet, arrowhead) {
            var link=new myLink();
            // console.log(evt);
            // console.log("f");
            // console.log(evt.paper.model.getLinks());
            var ev=evt.paper.model.getLinks();
            //ora in ev ho i link ma se li modifico non si modificano nel grafo quindi l'unica cosa che 
            //possiamo fare e togliere il link con la remove e poi mettere quello nuovo 
            link.attributes=ev[0].attributes;
            link.changed=ev[0].changed;
            link.ports=ev[0].ports;
            link.id=ev[0].id;
            link.cid=ev[0].cid;
            ev[0]=link;
            // console.log("e0");
            // console.log(ev[0]);
            // console.log(evt.paper.model.getLinks());
        });
        /*
            TODO: implementare mostra descrizione al click ed al rightclick o specificare differenze da srs
        */
        this.paper.on('cell:contextmenu', function(cellView,evt,x,y) { 
            evt.stopPropagation(); // Stop bubbling so that the paper does not handle mousedown.
            evt.preventDefault();  // Prevent displaying default browser context menu. 
            var $contextMenu = $('<div id="context-menu"></div>');
            var height = Math.max(
                document.body.scrollHeight, document.documentElement.scrollHeight,
                document.body.offsetHeight, document.documentElement.offsetHeight,
                document.body.clientHeight, document.documentElement.clientHeight
            );
            $contextMenu.css({
                width: '100%',
                height: height + 'px',
                position: 'absolute',
                top: evt.clientY+'px',
                left: evt.clientX+'px',
                zIndex: 9999,
                "max-height" : window.innerHeight - 3,
            });
            $contextMenu.addClass('angular-bootstrap-contextmenu dropdown clearfix');
            var $ul = $('<ul>');
                $ul.css({
                    display: 'block',
                    position: 'relative',
                    left: 0,
                    top: 0,
                    "z-index": 10000
                });
            $ul.addClass('dropdown-menu');
            var $ellimina = $('<button class="btn dropdown-toggle" style="width:100%">Ellimina</button>');

            //ELLIMINA
            $ellimina.on('mousedown', function (e) {
                cellView.model.remove();
                //L'elliminazione dei link ad esso attaccati viene fatta in automatico
            });
            $ul.append($ellimina);
            var $settaparam = $('<button class="btn dropdown-toggle" style="width:100%">Setta Parametri</button>');
            
            //SETTA PARAMETRI
            $settaparam.on('mousedown', function (e) {
                if(cellView.model.hasParametro == 'true'){
                    var corretto = false;
                    while(!corretto){
                        var newValue = $window.prompt("Inserisci "+cellView.model.nomeParametro+":",
                             cellView.model.paramValue);
                        /*
                    TODO: gestire controllo correttezza parametri
                    inserimento range min max in operatore?
                    if(vale condizione){corretto = true;}
                    */
                        corretto = true;
                    }
                    cellView.model.paramValue = newValue;
                }
                else{
                    $window.alert("L'operatore selezionato non ha parametri");
                }
            });

            
            $ul.append($settaparam);
            $contextMenu.append($ul);
            $(document).find('body').append($contextMenu);

            $(document.body).on('mousedown', function (e) {
                $("#context-menu").remove();
            });

        });
    };


    
/**
 * Input: posizione [x,y] rispetto foglio di lavoro
 * inPorts: array di id delle porte di ingresso
 * outPorts: array di id porte di uscita
 * 
 * TODO: cambiare paramentri, viene passato il json e io ricorstrusco l'operatore
 * 
 */



this.onDrop = function(JSONop, tipoOp){
        var JSONtypeOp = '';
        for(var i = 0; i<JSONop.operatori.length; i++){
            if(JSONop.operatori[i].tipo == tipoOp){
                JSONtypeOp = JSONop.operatori[i].operatore
            }
        }
        var op = '';
        var testoOperatore = joint.util.breakText(JSONop.nome, { width: 53 });
        if(JSONop.categoria=="OperatoreElementare"){
            op=new operatoreElementare();
            op.fromJSON(JSONtypeOp, JSONop, testoOperatore);
        }
        else if(JSONop.categoria=="OperatoreComplesso"){
            op=new operatoreComplesso();
            op.fromJSON(JSONtypeOp, JSONop, testoOperatore);
        }
        else if(JSONop.categoria=="OperatoreIORegola"){
            op=new operatoreIORegola();
            op.fromJSON(JSONtypeOp, JSONop, testoOperatore);
            console.log(op);

        }
        if(this.paper.model != ''){
            this.paper.model.addCell(op);
        }
}



// this.onClickFoglio=function(e){
//     /*
//     PROBLEMA: FA CASINO CON JOINT, QUANDO C'è JOINT NON FUNZIONA PIU
//     */
//     if(ListaOperatoriService.isClickedOp){
//         //posiziona operatore in punto dato da x e y con la funzione aggiungi operatore
//         //da sistemare controllo tipo
//         var x=e.pageX;
//         var y=e.pageY;
//         var jop=ListaOperatoriService.opClicked;
//         var op='';
//         if(jop.categoria=="OperatoreElementare"){
//             op=new operatoreElementare();
//             op.fromJson(ListaOperatoriService.opClickedTipo);
//         }
//         else if(jop.categoria=="OperatoreComplesso"){
//             op=new operatoreComplesso();
//             op.fromJson(ListaOperatoriService.opClickedTipo);
//         }
//         else if(jop.categoria=="OperatoreIOrRegola"){
//             op=new operatoreIORegola();
//             op.fromJson(ListaOperatoriService.opClickedTipo);
//         }
//         ListaOperatoriService.isClikedOp=false;
//         ListaOperatoriService.opClicked='';
//     }
// };
       

/*
    MODO CORRETTO DI METTERE IL TIPO:
        CREO UN NUOVO ATTRIBUTO PER OGNI PORTA CHIAMATO TIPO
        L'attributo si troverà in
        operatore.attributes.ports.items[j].tipo = 'int';
        j: # porta
*/

    // for(var j = 0; j<operatore.attributes.ports.items.length; j++){
    //     var ports, types;
    //     if(operatore.attributes.ports.items[j].group == 'out'){
    //         types = $outPortsTypes;
    //         ports = $outPorts
    //     }
    //     else{
    //         types = $inPortsTypes;
    //         ports = $inPorts;
    //     }
    //     for(var i = 0; i<ports.length; i++){
    //         if(ports[i]==operatore.attributes.ports.items[j].id)
    //             operatore.attributes.ports.items[j].tipo = types[i];
    //     }
    // }


    // $testoOperatore = joint.util.breakText($testoOperatore, { width: 53 });
    // operatore.attr('.label/text', $testoOperatore);
    // if(this.grafo != ''){
    //     this.grafo.addCell(operatore);
    //   }
    // if(this.operatoreComplesso != ''){
    //     this.operatoreComplesso.embed(operatore);
    // }
      
    //     ListaOperatoriService.isClickedOp=false;
    //     ListaOperatoriService.opCliked='';
    //     return operatore; 
    // }


  this.isRule=function(){
    return true;
  };


  this.verificaCorrettezza=function(){
        return ValidityCheckerService.verificaCorrettezza(this.paper.model);
  };

  this.esportaRegola=function(){
      /*
      TODO: prima controllare correttezza regola 
      */
      var stringXML = this.generaXML();
      /*
      Salvare file
      */
      var filename = 'rule.xml'       
      var blob = new Blob([stringXML], {type: 'text/plain'});
       if (window.navigator && window.navigator.msSaveOrOpenBlob) {
            window.navigator.msSaveOrOpenBlob(blob, filename);
        } else{
            var e = document.createEvent('MouseEvents'),
            a = document.createElement('a');
            a.download = filename;
            a.href = window.URL.createObjectURL(blob);
            a.dataset.downloadurl = ['text/json', a.download, a.href].join(':');
            e.initEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
            a.dispatchEvent(e);
    }
    


  };

  this.generaXML=function(){
    var stringXML;
    stringXML='<model="'+this.nomeFoglioDiLavoro+'" class="package.Rule">';
    var operatori=this.paper.model.getElements();
    var links=this.paper.model.getLinks();
    var i;
    var str='';
    for(i=0; i<operatori.length;i++){
                console.log(operatori[i]);

        str=str+operatori[i].esportaXML();
    }
    for(i=0; i<links.length; i++){
        console.log(links[i]);
        console.log(links[i].name);
        str=str+links[i].esportaXML();
    }
    console.log(str);
    stringXML=stringXML+str;
    stringXML=stringXML+'</model>';
    return stringXML;

  };





/*  ....ALTRO...  */ 
this.log = function(){
    console.log("Grafo:");
    console.log(this.paper.model);
    console.log("FoglioLavoro: ")
    console.log(this.paper);
    var cells = this.paper.model.getCells();
    console.log("cells:");
    console.log(cells);
    console.log("Ports of 'Operatore': ")
    console.log(cells[2].getPorts());
};

});




