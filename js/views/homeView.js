import { stages } from '../data/stages.js';
import { progressSummary } from '../services/progressService.js';
export function homeView() {
  const app = document.querySelector('#app');
  const progress = progressSummary();
  app.innerHTML = `<div class="page home-page">
    <section class="route-section"><div class="route-grid">
      <div class="route-panel route-understanding"><div class="route-panel-header"><div><p class="route-kicker">まずは図をさわって</p><h2>理解を深める</h2><p>動かす・ぬる・分ける体験から、円の見方をつかもう。</p></div><span class="route-number">01</span></div>
        <div class="adventure-grid understanding-grid">
          <a class="adventure-card pizza" href="#play/pizza"><span class="adventure-art" aria-hidden="true">◔</span><p class="eyebrow">さわって動かす</p><h3>ピザこうじょう</h3><p>円を切って、平行四辺形に近づけよう。</p></a>
          <a class="adventure-card cake" href="#play/cake"><span class="adventure-art" aria-hidden="true">◕</span><p class="eyebrow">ぬって見つける</p><h3>ケーキショップ</h3><p>何切れ分かをぬって、分数を見つけよう。</p></a>
          <a class="adventure-card rescue" href="#play/rescue"><span class="adventure-art" aria-hidden="true">◎</span><p class="eyebrow">図で考える</p><h3>ずけいレスキュー</h3><p>道具を選んで、色の部分を助けよう。</p></a>
        </div>
      </div>
      <div class="route-panel route-practice"><div class="route-panel-header"><div><p class="route-kicker">分かったことを使って</p><h2>演習</h2><p>図形を見分けるところから、式と答えまで取り組もう。</p></div><span class="route-number">02</span></div>
        <div class="practice-summary"><div><strong>10</strong><span>ステージ</span></div><div><strong>${progress.correct}</strong><span>正解数</span></div></div>
        <a class="btn btn-primary practice-launch" href="#challenge">演習をはじめる</a>
        <a class="btn btn-secondary practice-list-link" href="#stages">ステージ一覧を見る</a>
        <p class="small-note">「理解を深める」のあとに進むのがおすすめです。</p>
      </div>
    </div></section>
  </div>`;
}

export function stagesView() {
  const app = document.querySelector('#app');
  app.innerHTML = `<div class="page"><div class="toolbar"><div><p class="eyebrow">チャレンジタワー</p><h1>じっくり考える10ステージ</h1><p class="lead">操作で分かってきたら、式や答えまで自分で考えよう。</p></div><a class="btn btn-secondary" href="#home">島へ戻る</a></div><div class="stage-grid section">${stages.map(stage => `<a class="card stage-card" href="#practice/${stage.id}"><span class="stage-number">${stage.id}</span><h3>${stage.name}</h3><p>${stage.description}</p></a>`).join('')}</div></div>`;
}
