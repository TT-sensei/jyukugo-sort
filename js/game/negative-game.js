window.NegativeJukugoGame=class{
  constructor(ui,onEnd){
    this.ui=ui;
    this.onEnd=onEnd;
    this.faller=new FallingWord(ui.wordCard,ui.field,()=>this.answer(null));
  }
  shuffle(a){
    for(let i=a.length-1;i>0;i--){
      const j=Math.floor(Math.random()*(i+1));
      [a[i],a[j]]=[a[j],a[i]];
    }
    return a;
  }
  start(){
    this.quit();
    this.pool=this.shuffle([...NEGATIVE_JUKUGO_DATA]).slice(0,8);
    this.index=0;
    this.correct=0;
    this.score=0;
    this.combo=0;
    this.maxCombo=0;
    this.missed=[];
    this.locked=false;
    this.ui.missStack.innerHTML="";
    this.ui.feedback.className="negative-feedback";
    this.next();
  }
  next(){
    if(this.missed.length>=4)return this.end();
    if(this.index>=this.pool.length)return this.end();
    this.q=this.pool[this.index++];
    this.locked=false;
    this.ui.feedback.className="negative-feedback";
    this.ui.word.textContent=this.q.word;
    this.ui.prompt.textContent="あたまに入る漢字は？";
    this.ui.choices.innerHTML="";
    const choices=[
      ["不","～でない"],
      ["未","まだ～ない"],
      ["無","～がない"],
      ["非","～ではない"]
    ];
    choices.forEach(([value,hint])=>{
      const b=document.createElement("button");
      b.className="negative-choice";
      b.innerHTML=`<b>${value}</b><small>${hint}</small>`;
      b.onclick=()=>this.answer(value);
      this.ui.choices.append(b);
    });
    this.ui.wordCard.hidden=false;
    this.faller.start(78);
    this.hud();
  }
  answer(value){
    if(this.locked)return;
    this.locked=true;
    this.faller.pause();
    const ok=value===this.q.answer;
    if(ok){
      this.correct++;
      this.score+=100+this.combo*10;
      this.combo++;
      this.maxCombo=Math.max(this.maxCombo,this.combo);
      this.ui.wordCard.classList.remove("correct-burst");
      void this.ui.wordCard.offsetWidth;
      this.ui.wordCard.classList.add("correct-burst");
      setTimeout(()=>this.ui.wordCard.classList.remove("correct-burst"),720);
    }else{
      this.combo=0;
      this.missed.push(this.q.id);
      this.ui.missStack.insertAdjacentHTML("beforeend",`<span class="chip">${this.q.completed}</span>`);
    }
    this.ui.choices.querySelectorAll("button").forEach(b=>b.disabled=true);
    const title=ok?"○ 正解":"△ 正しい答え";
    const answerText=`「${this.q.completed}」`;
    this.ui.feedback.className="negative-feedback show "+(ok?"good":"bad");
    this.ui.feedback.innerHTML=`<strong>${title}</strong><span>${answerText}</span><small>${this.q.explanation}</small>`;
    this.hud();
    setTimeout(()=>this.next(),1700);
  }
  hud(){
    this.ui.progress.textContent=`${Math.min(this.index,this.pool.length)} / ${this.pool.length}`;
    this.ui.correct.textContent=this.correct;
    this.ui.combo.textContent=this.combo;
    this.ui.miss.textContent=`${this.missed.length} / 4`;
  }
  pause(){if(!this.locked)this.faller.pause()}
  resume(){if(!this.locked)this.faller.resume()}
  quit(){this.faller.stop()}
  end(){
    this.faller.stop();
    this.onEnd({
      correct:this.correct,
      total:this.pool.length,
      score:this.score,
      maxCombo:this.maxCombo,
      missed:this.missed,
      completed:this.index>=this.pool.length&&this.missed.length<4
    });
  }
};