"use strict";


if ( ! (window.File && window.FileReader && window.FileList && window.Blob)) {
  alert('The File APIs are not fully supported in this browser.');
}


function createNDimArray(dimensions) {
    if (dimensions.length > 0) {
        var dim = dimensions[0];
        var rest = dimensions.slice(1);
        var newArray = new Array(dim);
        for (var i = 0; i < dim; i++) {
            newArray[i] = createNDimArray(rest);
        }
        return newArray;
     } else {
        return undefined;
     }
 }


 function create2DimArray(dimensions) {
	 var newArray = new Array(dimensions[0]);
	 for (var i = 0; i < dimensions[0]; i++) {
			 newArray[i] = new Array(dimensions[1]);
	 }
	 return newArray;
  }


var gr;
class MyGraph{
	constructor(n) {
		this.n=n;//Количество вершин
		this.adjacency=create2DimArray([this.n,this.n]);//Матрица смежности
		this.distance=create2DimArray([this.n,this.n]);//Матрица расстояний
		this.сonnection=create2DimArray([this.n,this.n]);//Матрица связности
		for(var i=0;i<n;i++)
			for(var j=0;j<n;j++){
				this.adjacency[i][j]=0;
				this.distance[i][j]=0;
				this.сonnection[i][j]=0;
			}
		this.redundancy=0;//Избыточность
		this.redundancy2=0;//Отклонение заданного распределения вершин от равномерного
		this.Q=0;//Абсолютная компактность
		this.compactness=0;//Относительаня компактность
		this.d=0;//Диаметр системы
		this.sigma=0;//Степень центрацизации
	}
	calc_сonnection(){
		if (this.n > 0){
				var Ak=createNDimArray([this.n,this.n,this.n]);
				for (var i = 0; i < this.n; i++)
            for (var j = 0; j < this.n; j++)
                Ak[0][i][j] = this.adjacency[i][j];
        for (var k = 1; k < this.n; k++){
            for (var i = 0; i < this.n; i++)
                for (var j = 0; j < this.n; j++){
                    Ak[k][i][j] = 0;
                    for (var m = 0; m < this.n; m++)
                        Ak[k][i][j] += Ak[k - 1][i][m]*this.adjacency[m][j];
                }
        }
        for (var i = 0; i < this.n; i++)
            for (var j = 0; j < this.n; j++)
                this.сonnection[i][j] = 0;
        for (var k = 0; k < this.n; k++){
            for (var i = 0; i < this.n; i++)
                for (var j = 0; j < this.n; j++)
                    this.сonnection[i][j] += Ak[k][i][j];
        }

        for (var i = 0; i < this.n; i++)
            for (var j = 0; j < this.n; j++)
                if (this.сonnection[i][j] >= 1)this.сonnection[i][j]=1;
    }
	}
	calc_redundadncy(){
		var R=0;
		for (var i = 0; i <this.n; i++)
        for (var j = 0; j < this.n; j++)
            R += this.adjacency[i][j];
    R=R*0.5/(this.n-1)-1;
		this.redundancy=R;
	}
	calc_redundadncy2(){
		var edgecount=0;
		for(var i=0;i<this.n;i++)
			for(var j=i+1;j<this.n;j++)
				if(this.adjacency[i][j]==1)edgecount=edgecount+1;
		var e2 = 0;
    for (var i = 0; i < this.n; i++){
        var degreeV = 0;
        for (var j = 0; j < this.n; j++)
            degreeV += this.adjacency[i][j];
        e2 += degreeV * degreeV;
    }
    e2 -=(4*edgecount*edgecount)/this.n;
		this.redundancy2=e2;
	}
	calc_compactness(){
		var Q=0;
		var Qmin=this.n*(this.n-1);
		for(var i=0;i<this.n;i++)
			for(var j=0;j<this.n;j++){
				Q=Q+this.distance[i][j];
			}
		this.Q=Q;
		var Qrel=(Q/Qmin)-1;
		this.compactness=Qrel;
	}

	calc_distancematr(){
      var size = this.n;
      for (var i = 0; i < size; i += 1) {
        for (var j = 0; j < size; j += 1) {
          if (i === j) {
            this.distance[i][j] = 0;
          } else if (this.adjacency[i][j]==0) {
            this.distance[i][j] = Infinity;
          } else {
            this.distance[i][j] = this.adjacency[i][j];
          }
        }
      }
      for (var k = 0; k < size; k += 1) {
        for (var i = 0; i < size; i += 1) {
          for (var j = 0; j < size; j += 1) {
            if (this.distance[i][j] > this.distance[i][k] + this.distance[k][j]) {
              this.distance[i][j] = this.distance[i][k] + this.distance[k][j];
            }
          }
        }
      }
	}
	calc_d(){
		var max=this.distance[0][0];
		var size = this.n;
		for (var i = 0; i < size; i += 1)
			for (var j = 0; j < size; j += 1)
				if(max<this.distance[i][j])max=this.distance[i][j];
		this.d=max;
	}
	calc_sigma(){
		var size = this.n;
		var Z=new Array(size);
		for(var i=0;i<size;i++){
			var tmp=0;
			for(var j=0;j<size;j++){
				if(isFinite(this.distance[i][j])==false){
					tmp=Infinity;
					break;
				}
				tmp=tmp+this.distance[i][j];
			}
			Z[i]=this.Q/(2*tmp);
		}
		var Zmax=Z[0];
		for(var i=1;i<size;i++)
			if(Z[i]>Zmax)Zmax=Z[i];
		this.sigma=((size-1)*(2*Zmax-size))/(Zmax*(size-2))
	}
	calc_all(){
		this.calc_сonnection();
		this.calc_distancematr();
		this.calc_redundadncy();
		this.calc_redundadncy2();
		this.calc_compactness();
		this.calc_d();
		this.calc_sigma();
	}
	print_html(){
		var endstr="<br>";
		var s="Кількість вершин="+this.n+endstr;
		s=s+endstr;
		s=s+"Матриця суміжності:"+endstr;
		for(var i=0;i<this.n;i++)
			for(var j=0;j<this.n;j++){
				s=s+this.adjacency[i][j];
				if(j!=(this.n-1))s=s+", ";
				else s=s+endstr;
			}
		s=s+endstr;
		s=s+"Матриця відстаней:"+endstr;
		for(var i=0;i<this.n;i++)
			for(var j=0;j<this.n;j++){
				var tmp=this.distance[i][j];
				if(isFinite(tmp)==false)
					tmp="&infin;";
				s=s+tmp;
				if(j!=(this.n-1))s=s+", ";
				else s=s+endstr;
			}
		s=s+endstr;
		s=s+"Матриця зв'язності:"+endstr;
		for(var i=0;i<this.n;i++)
			for(var j=0;j<this.n;j++){
				s=s+this.сonnection[i][j];
				if(j!=(this.n-1))s=s+", ";
				else s=s+endstr;
			}
		s=s+endstr;
		var numprinted=6;
		var printed=new Array(numprinted);
		printed[0]=this.redundancy;
		printed[1]=this.redundancy2;
		printed[2]=this.Q;
		printed[3]=this.compactness;
		printed[4]=this.d;
		printed[5]=this.sigma;
		for(var i=0;i<numprinted;i++){
		  if(isFinite(printed[i])==false)printed[i]="=&infin;";
		  else{
			if(isNaN(printed[i])==true)printed[i]="=Невизначеність";
			else{
			  var tmp=Number(printed[i].toFixed(3));
			  if(Math.abs(printed[i]-tmp)>0.0001){
				printed[i]="&asymp;"+tmp;
			  }
			  else{
				printed[i]="="+tmp;
			  }
			}
		  }
		}
		s=s+"Надлишковість структури(R)"+printed[0]+endstr;
		s=s+endstr;
		s=s+"Квадратне відхилення заданого розподілу вершин від рівномірного(&epsilon;<sup>2</sup>)"+printed[1]+endstr;
		s=s+endstr;
		s=s+"Абсолютна компактність структури(Q)"+printed[2]+endstr;
		s=s+endstr;
		s=s+"Відносна компактність структури(Q<sub>відн</sub>)"+printed[3]+endstr;
		s=s+endstr;
		s=s+"Діаметр структури(d)"+printed[4]+endstr;
		s=s+endstr;
		s=s+"Ступінь центрацізації(&sigma;)"+printed[5]+endstr;
		s=s+endstr;
		return s;
	}
}


var errormessages=[];
errormessages[0]="Кількість вершин повинна бути цілим додатнім числом";
errormessages[1]="Файл не коректний";


var messages=[];
messages[0]="Введіть кількість вершин";
messages[1]="Введіть матрицю суміжності"
messages[2]="Оберіть спосіб вводу структури";


var buttonnames=[];
buttonnames[0]="Готово";
buttonnames[1]="Ввести матрицю суміжності структури вручну";
buttonnames[2]="Завантажити матрицю суміжності структури з файла";
buttonnames[3]="Намалювати структуру";
buttonnames[4]="Зберегти матрицю суміжності графа у файл";


function drawans(maindiv){
		maindiv.innerHTML="";
		var textdiv=document.createElement("div");
		textdiv.className="textdiv";
		maindiv.appendChild(textdiv);
		gr.calc_all();
		textdiv.innerHTML=gr.print_html();
}


var textFile = null;
function makeTextFile(text){
	var data = new Blob([text], {type: 'text/plain'});
    if (textFile !== null) {
      window.URL.revokeObjectURL(textFile);
    }
    textFile = window.URL.createObjectURL(data);
    return textFile;
}


function save(){
    var link1 = document.getElementById('link');
	link1.innerHTML="Завантажити";
	var lasts=gr.n+"\r\n";
	for(var i=0;i<gr.n;i++)
		for(var j=0;j<gr.n;j++){
			lasts=lasts+gr.adjacency[i][j];
			if(j!=(gr.n-1))lasts=lasts+" ";
			else lasts=lasts+"\r\n";
		}
	console.log(lasts);
	link1.href = makeTextFile(lasts);
	var evt = document.createEvent("MouseEvents");
 	evt.initMouseEvent("click", true, true, window,0, 0, 0, 0, 0, false, false, false, false, 0, null);
	link1.dispatchEvent(evt);
}


function changeadj(ev){
	var id=ev.target.id;
	var sel=document.getElementById(id);
	id=id.slice(3,id.length);
	var ar=id.split("_");
	var i=Number(ar[0]);
	var j=Number(ar[1]);
	gr.adjacency[i-1][j-1]=sel.selectedIndex;
	sel=document.getElementById("sel"+j+"_"+i);
	sel.selectedIndex=gr.adjacency[i-1][j-1];
	gr.adjacency[j-1][i-1]=gr.adjacency[i-1][j-1];
}


var prev_n=0;
function drawtable(maindiv){
	var tmp=document.getElementById("first_text_input");
	var n=Number(tmp.value,10);
	tmp=document.getElementById("first_errordiv");
	if((n<0)||(isNaN(n)==true)){
		 tmp.innerHTML=errormessages[0];
		 if(prev_n>0){
			 tmp=document.getElementById("adjacencymatrdiv");
			 maindiv.removeChild(tmp);
			 tmp=document.getElementById("messagediv");
			 maindiv.removeChild(tmp);
			 tmp=document.getElementById("endbutton");
			 maindiv.removeChild(tmp);
			 tmp=document.getElementById("outfile");
			 maindiv.removeChild(tmp);
			 tmp=document.getElementById("link");
				 maindiv.removeChild(tmp);
		 }
		 prev_n=0;
		 return;
	}
	tmp.innerHTML="";
	if(n!=prev_n){
		gr=new MyGraph(n);
		if(prev_n!=0){
			tmp=document.getElementById("adjacencymatrdiv");
			maindiv.removeChild(tmp);
			tmp=document.getElementById("messagediv");
			maindiv.removeChild(tmp);
			tmp=document.getElementById("endbutton");
 		  maindiv.removeChild(tmp);
			tmp=document.getElementById("outfile");
			maindiv.removeChild(tmp);
			tmp=document.getElementById("link");
 		  maindiv.removeChild(tmp);
		}
		var messagediv=document.createElement("div");
		messagediv.id="messagediv";
		messagediv.className="textdiv";
		messagediv.innerHTML=messages[1];
		maindiv.appendChild(messagediv);
		var adjacencydiv=document.createElement("div");
		adjacencydiv.id="adjacencymatrdiv";
		maindiv.appendChild(adjacencydiv);
		var size=100/(n+1);
		for(var i=0;i<=n;i++){
			var raw=document.createElement("div");
			raw.className="adjacencyraw";
			raw.id="raw_"+i;
			adjacencydiv.appendChild(raw);
			for(var j=0;j<=n;j++){
				var cell=document.createElement("div");
				cell.className="adjacencycelldiv";
				cell.id="cell_"+i+"_"+j;
				raw.appendChild(cell);
				cell.style.width=size+"%";
				cell.style.paddingBottom=cell.style.width;
				var content=document.createElement("div");
				content.className="content"
				cell.appendChild(content);
				var contentdiv=document.createElement("div");
				contentdiv.className="contentdiv"
				content.appendChild(contentdiv);
				if((i==0)&&(j==0))cell.style.backgroundColor="gray";
				if(((i==0)&&(j!=0))||((i!=0)&&(j==0))){
						cell.style.backgroundColor="#B2B0C6";
						contentdiv.innerHTML=i+j;
				}
				if((i==j)&&(i!=0)){
					cell.style.backgroundColor="#FF9999";
					contentdiv.innerHTML="0";
				}
				if((i!=0)&&(j!=0)&&(i!=j)){
					var adjselect=document.createElement("select");
					adjselect.className="adjacencyselect"
					adjselect.id="sel"+i+"_"+j;
					contentdiv.appendChild(adjselect);
					adjselect.innerHTML="<option value=0>0</option>";
					adjselect.innerHTML+="<option value=1>1</option>";
					adjselect.addEventListener("change",function(adjselect){changeadj(adjselect);});
				}
			}
		}
    if(n>9){
      var adjacencydiv=document.getElementById("adjacencymatrdiv");
  		adjacencydiv.style.fontSize="50%";
      if(n>20)adjacencydiv.style.fontSize="30%";
    }
		prev_n=n;
		var endbutton=document.createElement("button");
		endbutton.className="endbutton";
		endbutton.id="endbutton";
		endbutton.innerHTML=buttonnames[0];
		maindiv.appendChild(endbutton);
		endbutton.addEventListener("click",function(){drawans(maindiv);});
		var dl=document.createElement("button");
		dl.id="outfile";
		dl.innerHTML="Зберегти стурктуру у файл";
		maindiv.appendChild(dl);
		dl.addEventListener("click",save);
		var link1=document.createElement("a");
		link1.id="link";
		link1.download="struct.txt";
		maindiv.appendChild(link1);
	}
}
function GUI_load_from_matrix(maindiv){
	maindiv.innerHTML="";
	var textdiv=document.createElement("div");
	textdiv.innerHTML=messages[0];
	textdiv.className="textdiv";
	maindiv.appendChild(textdiv);
	var firstdiv=document.createElement("div");
	firstdiv.id="first_div";
	maindiv.appendChild(firstdiv);
	var firstdiv_cell=document.createElement("div");
	firstdiv_cell.className="first_div_cell";
	firstdiv_cell.id="fdc1";
	firstdiv.appendChild(firstdiv_cell);
	var firstdiv_cell=document.createElement("div");
	firstdiv_cell.className="first_div_cell";
	firstdiv_cell.id="fdc2";
	firstdiv.appendChild(firstdiv_cell);
  var tmp=document.createElement("input");
	tmp.type="text";
	tmp.className="def_textinput";
	tmp.id="first_text_input";
	var par=document.getElementById("fdc1");
	par.appendChild(tmp);
	tmp=document.createElement("button");
	tmp.className="def_button";
	tmp.innerHTML=buttonnames[0];
	firstdiv.appendChild(tmp);
	par=document.getElementById("fdc2");
	par.appendChild(tmp);
	tmp.addEventListener("click",function(){drawtable(maindiv);});
	var errordiv=document.createElement("div");
	errordiv.className="errordiv";
	errordiv.id="first_errordiv";
	maindiv.appendChild(errordiv);
}
function handleFileSelect(evt) {
    var file = evt.target.files[0];
    if (!file.type.match('text.*')) {
            return alert(file.name + " is not a valid text file.");
    }
    var reader = new FileReader();
    reader.readAsText(file);
    reader.onload = function (e){
			var words=[];
			words = reader.result.split('\n');
			var erdiv=document.getElementById("file_errordiv");
			if(words.length==0){
				erdiv.innerHTML=errormessages[1];
				return;
			}
			var n=Number(words[0]);
			if((isNaN(n)==true)||(n<0)){
				erdiv.innerHTML=errormessages[1];
				return;
			}
			if(n!=(words.length-1)){
					erdiv.innerHTML=errormessages[1];
					return;
			}
			gr=new MyGraph(n);
			for(var i=0;i<n;i++){
				var word=words[i+1];
				word=word.trim();
				word=word.split(" ");
				if(word.length!=n){
					erdiv.innerHTML=errormessages[1];
					return;
				}
				for(var j=0;j<n;j++){
					var tmp=Number(word[j]);
					if((isNaN(tmp)==true)||((tmp!=0)&&(tmp!=1))){
							erdiv.innerHTML=errormessages[1];
							return;
					}
					if((tmp==1)&&(i==j)){
						erdiv.innerHTML=errormessages[1];
						return;
					}
					gr.adjacency[i][j]=tmp;
				}
		}
		for(var i=0;i<n;i++)
			for(var j=0;j<n;j++){
				if(gr.adjacency[i][j]!=gr.adjacency[j][i]){
					erdiv.innerHTML=errormessages[1];
					return;
				}
			}
		drawans(maindiv);
	};
	var b=document.getElementById("fileinput");
	b.value="";
}


function GUI_load_from_file(maindiv){
	maindiv.innerHTML="";
	var textdiv=document.createElement("div");
	textdiv.className="textdiv";
	var s="<strong>Формат файлу:</strong>"+"<br>";
	s=s+"Кільксть вершин"+"<br>";
	s=s+"Матриця суміжності"+"<br>"+"<br>";
	s=s+"<strong>Приклад файлу:</strong>"+"<br>";
	s=s+"5"+"<br>";
	s=s+"0 1 1 1 0"+"<br>";
	s=s+"1 0 1 1 1"+"<br>";
	s=s+"1 1 0 1 0"+"<br>";
	s=s+"1 1 1 0 1"+"<br>";
	s=s+"0 1 0 1 0"+"<br>"+"<br>";
	textdiv.innerHTML=s;
	maindiv.appendChild(textdiv);
	var finput=document.createElement("input");
	finput.id="fileinput";
	finput.type="file";
	finput.className="file_input_text mdl-textfield__input";
	maindiv.appendChild(finput);
	finput.addEventListener("change", handleFileSelect)
	var errordiv=document.createElement("div");
	errordiv.className="errordiv";
	errordiv.id="file_errordiv";
	maindiv.appendChild(errordiv);
}


function GUI_draw(maindiv){
	maindiv.innerHTML="";
}


function drawmainbuttons(maindiv){
	var tmp=document.createElement("div");
	tmp.className="textdiv";
	tmp.id="mydiv";
	maindiv.appendChild(tmp);
	tmp.innerHTML=messages[2];
	var adjbutton=document.createElement("button");
	adjbutton.className="mainbutton";
	adjbutton.innerHTML=buttonnames[1];
	maindiv.appendChild(adjbutton);
	var filebutton=document.createElement("button");
	filebutton.className="mainbutton";
	filebutton.innerHTML=buttonnames[2];
	maindiv.appendChild(filebutton);
	var drawbutton=document.createElement("button");
	drawbutton.className="mainbutton";
	drawbutton.innerHTML=buttonnames[3];
	//maindiv.appendChild(drawbutton);
	adjbutton.addEventListener("click",function(){GUI_load_from_matrix(maindiv)});
	filebutton.addEventListener("click",function(){GUI_load_from_file(maindiv)});
	//drawbutton.addEventListener("click",function(){GUI_draw(maindiv)});
}


var maindiv;
function create(id){
	maindiv=document.getElementById(id);
	maindiv.style.width=window.innerWidth;
	maindiv.style.height=window.innerHeight;
	drawmainbuttons(maindiv);
}


create("root");


/*TO DO
1. красивый fileinput
2. рисовать графы*/
