export const numberPad=()=>`<div class="number-pad">${['7','8','9','4','5','6','1','2','3','0','.','⌫'].map(k=>`<button class="formula-key" data-number="${k}">${k}</button>`).join('')}</div>`;
