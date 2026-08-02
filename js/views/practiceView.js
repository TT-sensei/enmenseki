import { getStageProblems, generateRandom, randomFromStage } from '../services/problemService.js';
import { renderDiagram } from '../diagrams/composite.js';
import { STRATEGIES, UNITS } from '../constants.js';
import { formulaBuilder, bindFormulaBuilder } from '../components/formulaBuilder.js';
import { hintPanel } from '../components/hintPanel.js';
import { numberPad } from '../components/numberPad.js';
import { fractionSteps } from '../components/fractionView.js';
import { validateExpression, parseMathExpression, diagnoseAnswer } from '../utils/validator.js';
import { recordAttempt } from '../services/progressService.js';
import { loadData, saveData } from '../storage.js';
import { formatNumber } from '../utils/formatter.js';
import { playTone } from '../services/soundService.js';
import { toast } from '../components/toast.js';

const valueLabels = {
  radius: '半径', diameter: '直径', angle: '中心角', arc: '弧の長さ',
  side: '一辺', outerRadius: '外側の半径', innerRadius: '内側の半径',
  smallDiameter: 'くぼみの直径', largeDiameter: 'ふくらみの直径', totalDiameter: '全体の直径',
  area: '面積', circumference: '円周'
};

export function practiceView(stageId = '1', forcedProblem = null) {
  const stage = Number(stageId);
  const settings = loadData().settings;
  let problem = forcedProblem || randomFromStage(stage) || generateRandom();
  let step;
  let strategy;
  let expression;
  let answer;
  let unit;
  let hints;
  let attempts;
  let feedback;
  let answered;
  const app = document.querySelector('#app');
  const stepNames = ['図形を見分ける', '考え方を選ぶ', '式をつくる', '計算して答える'];

  function resetFields() {
    step = settings.alwaysClassify ? 1 : 2;
    strategy = settings.alwaysClassify ? null : problem.validStrategies[0];
    expression = '';
    answer = '';
    unit = problem.unit;
    hints = settings.helpOpen ? 1 : 0;
    attempts = 0;
    feedback = '';
    answered = false;
  }

  function nextProblem() {
    problem = stage === 0 ? generateRandom() : randomFromStage(stage);
    resetFields();
    draw();
  }

  function knownValuesHtml() {
    return Object.entries(problem.values)
      .filter(([, value]) => typeof value === 'number')
      .map(([key, value]) => `<button class="chip" data-known aria-pressed="false">${valueLabels[key] || key}：${value}</button>`)
      .join('');
  }

  function workHtml() {
    if (step === 1) {
      return `<h2>この図形は、どう考える？</h2>
        <div class="choice-list">${problem.strategyChoices.map(key => `<button class="choice ${strategy === key ? 'selected' : ''}" data-strategy="${key}">${STRATEGIES[key]}</button>`).join('')}</div>
        <button class="btn btn-primary" data-check-strategy ${strategy ? '' : 'disabled'}>決める</button>`;
    }
    if (step === 2) {
      return `<h2>考え方を確かめる</h2>
        <p>図の数値をタップして整理しよう。使う考え方はこれでよいかな？</p>
        <div class="feedback"><strong>${STRATEGIES[strategy]}</strong></div>
        ${problem.values.angle ? `<details><summary>中心角を分数で見る</summary>${fractionSteps(problem.values.angle, 5)}</details>` : ''}
        <div class="actions"><button class="btn btn-secondary" data-back>戻る</button><button class="btn btn-primary" data-to-expression>式をつくる</button></div>`;
    }
    if (step === 3) {
      return `<h2>式をつくる</h2>${formulaBuilder(expression)}
        <div class="actions"><button class="btn btn-secondary" data-back>戻る</button><button class="btn btn-primary" data-check-expression>式を確かめる</button></div>`;
    }
    return `<h2>計算して答える</h2>
      <p class="formula-display">${expression}</p>
      <div class="answer-row"><input class="answer-input" data-answer inputmode="decimal" value="${answer}" aria-label="答え"><select class="select" data-unit aria-label="単位">${UNITS.map(item => `<option ${item === unit ? 'selected' : ''}>${item}</option>`).join('')}</select></div>
      ${answered ? '' : numberPad()}
      ${answered ? `<section class="section"><h3>自分の考え方を振り返ろう</h3>
        <div class="choice-list">${problem.reflectionChoices.map(item => `<button class="choice" data-reflection>${item}</button>`).join('')}</div>
        <div class="actions"><button class="btn btn-primary" data-next-problem>次の問題</button><a class="btn btn-secondary" href="#result/${stage}">結果を見る</a></div>
        <details><summary>解説</summary><p>${problem.explanation}</p><p>答え：${formatNumber(problem.answer)} ${problem.unit}</p></details></section>` :
        `<div class="actions"><button class="btn btn-secondary" data-back>式に戻る</button><button class="btn btn-primary" data-check-answer>答えを確かめる</button></div>`}`;
  }

  function draw() {
    const data = loadData();
    data.lastRoute = `#practice/${stage || 1}`;
    saveData(data);
    app.innerHTML = `<div class="page">
      <div class="toolbar"><div><p class="eyebrow">${stage ? `ステージ ${stage}` : 'ランダム練習'}</p><h1>${problem.title}</h1></div><div class="actions"><a class="btn btn-secondary" href="#stages">ステージ一覧</a><button class="btn btn-secondary" data-random>別の問題</button></div></div>
      <div class="stepper">${stepNames.map((name, index) => `<div class="step ${index + 1 === step ? 'active' : index + 1 < step ? 'done' : ''}">${index + 1} ${name}</div>`).join('')}</div>
      <div class="learning-layout"><div class="problem-main"><section class="panel"><p class="lead">${problem.instruction}</p>
        <div class="diagram-box" data-diagram tabindex="0" role="button" aria-label="図形を強調する">${renderDiagram(problem.diagram)}</div>
        ${step >= 2 ? `<h3>図から分かること</h3><div class="tag-row">${knownValuesHtml()}</div>` : ''}</section>
        ${hintPanel(problem, hints)}</div>
        <aside class="problem-work sticky-work"><section class="panel">${workHtml()}${feedback ? `<div class="feedback ${feedback.startsWith('正解') ? 'success celebrate' : 'error'}">${feedback}</div>` : ''}</section></aside>
      </div></div>`;
    bind();
  }

  function bind() {
    app.querySelector('[data-random]').onclick = nextProblem;
    const diagram = app.querySelector('[data-diagram]');
    const toggleDiagram = () => diagram.classList.toggle('highlight');
    diagram.onclick = toggleDiagram;
    diagram.onkeydown = event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        toggleDiagram();
      }
    };
    app.querySelectorAll('[data-number]').forEach(button => {
      button.onclick = () => {
        answer = button.dataset.number === '⌫' ? answer.slice(0, -1) : answer + button.dataset.number;
        app.querySelector('[data-answer]').value = answer;
      };
    });
    app.querySelectorAll('[data-strategy]').forEach(button => {
      button.onclick = () => { strategy = button.dataset.strategy; draw(); };
    });
    app.querySelector('[data-check-strategy]')?.addEventListener('click', () => {
      attempts++;
      if (problem.validStrategies.includes(strategy)) {
        step = 2;
        feedback = 'その見方で考えられます。図の数値を整理しよう。';
      } else {
        feedback = '色のついた部分と全体の関係を見直そう。別の見方でも正しく説明できることがあります。';
      }
      draw();
    });
    app.querySelectorAll('[data-known]').forEach(button => {
      button.onclick = () => {
        const pressed = button.getAttribute('aria-pressed') !== 'true';
        button.setAttribute('aria-pressed', pressed);
        button.classList.toggle('selected', pressed);
      };
    });
    app.querySelector('[data-to-expression]')?.addEventListener('click', () => { step = 3; feedback = ''; draw(); });
    app.querySelectorAll('[data-back]').forEach(button => {
      button.onclick = () => { step = Math.max(1, step - 1); feedback = ''; draw(); };
    });
    if (step === 3) {
      bindFormulaBuilder(app, value => { expression = value; });
      app.querySelector('[data-check-expression]').onclick = () => {
        attempts++;
        let target;
        try { target = parseMathExpression(problem.expression); } catch { target = problem.answer; }
        const result = validateExpression(expression, target, problem.tolerance);
        if (!result.valid) feedback = result.error;
        else if (!result.correct) feedback = '式の結果が、求める部分の計算になっているか確かめよう。';
        else { step = 4; feedback = '式は合っています。計算して答えを出そう。'; }
        draw();
      };
    }
    app.querySelector('[data-answer]')?.addEventListener('input', event => { answer = event.target.value; });
    app.querySelector('[data-unit]')?.addEventListener('change', event => { unit = event.target.value; });
    app.querySelector('[data-check-answer]')?.addEventListener('click', () => {
      attempts++;
      const result = diagnoseAnswer(problem, answer, unit);
      feedback = result.message;
      recordAttempt(problem, { correct: result.correct, firstTry: attempts <= 2, hintsUsed: hints });
      playTone(loadData().settings.sound, result.correct);
      if (result.correct) { answered = true; toast('正解！ 学びを記録しました'); }
      draw();
    });
    app.querySelector('[data-next-problem]')?.addEventListener('click', nextProblem);
    app.querySelectorAll('[data-reflection]').forEach(button => {
      button.onclick = () => {
        app.querySelectorAll('[data-reflection]').forEach(item => item.classList.remove('selected'));
        button.classList.add('selected');
      };
    });
    app.querySelector('[data-next-hint]').onclick = () => { hints = Math.min(5, hints + 1); draw(); };
  }

  resetFields();
  draw();
}
