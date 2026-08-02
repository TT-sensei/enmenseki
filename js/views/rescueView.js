import { renderDiagram } from '../diagrams/composite.js';
import { awardPiece } from '../services/islandService.js';
import { toast } from '../components/toast.js';

const tools = [
  { id: 'whole', label: 'ぜんぶ求める' },
  { id: 'subtract', label: '大きい方から引く' },
  { id: 'collect', label: '同じ形を集める' },
  { id: 'half', label: '半分に分ける' }
];

const missions = [
  { title: 'ドーナツ型を助けよう', diagram: { kind: 'ring', outerRadius: 10, innerRadius: 6 }, tool: 'subtract', operator: '−', parts: ['10×10×3.14','−','6×6×3.14'], auto: '10×10×3.14 − 6×6×3.14', insight: '大きい円から、小さい円を外へ出す動きが引き算になるよ。' },
  { title: '葉っぱ型を助けよう', diagram: { kind: 'leaf', radius: 8 }, tool: 'collect', operator: '×', parts: ['(おうぎ形−三角形)','×','2'], auto: '(おうぎ形−三角形) × 2', insight: '同じ形が2つあるから、1つ分を求めて2倍できるね。' },
  { title: '正方形の外側を助けよう', diagram: { kind: 'square-circle', side: 12 }, tool: 'subtract', operator: '−', parts: ['12×12','−','6×6×3.14'], auto: '12×12 − 6×6×3.14', insight: '正方形ぜんぶから、内側の円を外へ出そう。' },
  { title: '半円を助けよう', diagram: { kind: 'sector', radius: 8, angle: 180 }, tool: 'half', operator: '÷', parts: ['8×8×3.14','÷','2'], auto: '8×8×3.14 ÷ 2', insight: '半円は円をちょうど半分にした形だね。' }
];

function wrongMessage(mission, choice) {
  if (mission.tool === 'subtract' && choice === 'whole') return 'おっと！ 小さい部分まで色がついたままだよ。内側を外へ出す道具を選ぼう。';
  if (mission.tool === 'collect') return '同じ形が左右にかくれているよ。1つずつ指で追ってみよう。';
  if (mission.tool === 'half') return '円の切れ目が、まっすぐはしからはしまで通っているよ。2つに分けてみよう。';
  return '図が「ちがうよ」と動いたね。色の部分と、いらない部分をもう一度見よう。';
}

export function rescueView() {
  const app = document.querySelector('#app');
  let missionIndex = 0;
  let phase = 'tool';
  let selectedTool = null;
  let toolSolved = false;
  let operatorSolved = false;
  let missionDone = false;
  let built = [];
  let used = new Set();
  let message = 'まず、図を助ける道具を1つ選ぼう。';
  let messageKind = '';

  function shuffledParts(mission) {
    return [mission.parts[2], mission.parts[0], mission.parts[1]];
  }

  function draw() {
    const mission = missions[missionIndex];
    const parts = shuffledParts(mission);
    app.innerHTML = `<div class="page play-shell"><div class="mission-banner"><div><strong>ずけいレスキュー</strong><p>ミッション ${missionIndex + 1}/${missions.length}</p></div><a class="btn btn-secondary" href="#home">島へ戻る</a></div><div class="play-board"><section class="game-stage rescue-stage ${toolSolved ? 'solved' : ''} ${messageKind === 'oops' ? 'oops' : ''}">${renderDiagram(mission.diagram)}${messageKind === 'oops' ? '<div class="sr-only" aria-live="assertive">図形が反応しました</div>' : ''}</section><aside class="panel game-panel"><p class="eyebrow">${phase === 'tool' ? 'レベル1　見る・選ぶ' : 'レベル2　カードをならべる'}</p><h1>${mission.title}</h1><div class="game-message ${messageKind}">${message}</div>
      ${phase === 'tool' ? `<h3>どの道具を使う？</h3><div class="choice-list strategy-tools">${tools.map(tool => `<button class="choice game-choice ${selectedTool === tool.id ? 'selected' : ''}" data-tool="${tool.id}" ${toolSolved ? 'disabled' : ''}>${tool.label}</button>`).join('')}</div>${toolSolved ? `<div class="feedback success">${mission.insight}</div><div class="built-expression">${mission.auto.replace(mission.operator, ' □ ')}</div><p>□に入る記号を選ぼう。</p><div class="operator-row">${['＋','−','×','÷'].map(operator => `<button class="operator-card" data-operator="${operator}" ${operatorSolved ? 'disabled' : ''}>${operator}</button>`).join('')}</div>${operatorSolved ? '<button class="btn btn-primary" data-level2>カードならべへ</button>' : ''}` : ''}` : missionDone ? `<div class="feedback success">図の動きが、この式になったよ。<div class="built-expression">${mission.auto}</div></div><span class="reward-pop">◎ ずけいのかけらを1こゲット！</span><button class="btn btn-primary" data-next-mission>${missionIndex === missions.length - 1 ? 'チャレンジタワーへ' : '次のミッション'}</button>` : `<h3>式カードを正しい順番でタップ</h3><div class="built-expression">${built.length ? built.join('　') : 'ここに式ができるよ'}</div><div class="expression-cards">${parts.map((part,index) => `<button class="expression-card ${used.has(index) ? 'used' : ''}" data-part="${index}" ${used.has(index) ? 'disabled' : ''}>${part}</button>`).join('')}</div><div class="actions"><button class="btn btn-secondary" data-reset-cards>やり直す</button><button class="btn btn-primary" data-check-cards ${built.length === mission.parts.length ? '' : 'disabled'}>式を確かめる</button></div>`}
      </aside></div></div>`;
    bind();
  }

  function bind() {
    const mission = missions[missionIndex];
    app.querySelectorAll('[data-tool]').forEach(button => {
      button.onclick = () => {
        selectedTool = button.dataset.tool;
        if (selectedTool === mission.tool) {
          toolSolved = true; messageKind = 'good'; message = 'その道具で助けられる！ 図が分かれて見えてきたよ。';
        } else {
          messageKind = 'oops'; message = wrongMessage(mission, selectedTool);
        }
        draw();
      };
    });
    app.querySelectorAll('[data-operator]').forEach(button => {
      button.onclick = () => {
        if (button.dataset.operator === mission.operator) {
          operatorSolved = true; messageKind = 'good'; message = `図の動きが「${mission.operator}」の式になった！`;
        } else {
          messageKind = 'oops'; message = mission.operator === '−' ? '足すと色の部分が増えすぎるよ。外へ出した部分は引こう。' : mission.operator === '×' ? '同じ形が2つあるよ。「2つ分」の記号を選ぼう。' : '半分は、2つに同じように分けることだね。';
        }
        draw();
      };
    });
    app.querySelector('[data-level2]')?.addEventListener('click', () => { phase = 'cards'; built = []; used = new Set(); messageKind = ''; message = '今度は、同じ式をカードで作ってみよう。'; draw(); });
    app.querySelectorAll('[data-part]').forEach(button => {
      button.onclick = () => {
        const index = Number(button.dataset.part);
        used.add(index); built.push(shuffledParts(mission)[index]); message = 'カードが式に入ったよ。次のカードを選ぼう。'; draw();
      };
    });
    app.querySelector('[data-reset-cards]')?.addEventListener('click', () => { built = []; used = new Set(); messageKind = ''; message = 'もう一度、左から読む順にタップしよう。'; draw(); });
    app.querySelector('[data-check-cards]')?.addEventListener('click', () => {
      if (built.join('|') === mission.parts.join('|')) {
        awardPiece('rescue'); toast('ずけいのかけらをゲット！'); missionDone = true; messageKind = 'good'; message = 'レスキュー成功！ 図の動きと式がつながったね。'; draw();
      } else {
        messageKind = 'oops'; message = 'カードの順番を変えると、図の動きと同じ式になるよ。左から見直そう。'; built = []; used = new Set(); draw();
      }
    });
    app.querySelector('[data-next-mission]')?.addEventListener('click', () => {
      if (missionIndex === missions.length - 1) { location.hash = '#challenge'; return; }
      missionIndex++; phase = 'tool'; selectedTool = null; toolSolved = operatorSolved = missionDone = false; built = []; used = new Set(); messageKind = ''; message = 'まず、図を助ける道具を1つ選ぼう。'; draw();
    });
  }
  draw();
}
