export const DEFAULT_HTML_BLOCK_CONTENT = `<style>
  .terminal { background: #0d1117; color: #58d68d; font-family: 'Courier New', monospace; padding: 16px; border-radius: 8px; height: 100%; box-sizing: border-box; overflow: auto; }
  .terminal .line { margin: 2px 0; font-size: 13px; }
  .terminal .prompt { color: #58a6ff; }
  .terminal .cmd { color: #e6edf3; }
  .terminal .out { color: #8b949e; }
  .blink { animation: blink 1s step-end infinite; }
  @keyframes blink { 50% { opacity: 0; } }
</style>
<div class="terminal">
  <div class="line"><span class="prompt">lumina@craft</span><span class="cmd"> ~ % whoami</span></div>
  <div class="line out">LuminaCraft - Personal Homepage Builder</div>
  <div class="line">&nbsp;</div>
  <div class="line"><span class="prompt">lumina@craft</span><span class="cmd"> ~ % cat wow.txt</span></div>
  <div class="line out">&#x6B38;&#x563F;</div>
  <div class="line">&nbsp;</div>
  <div class="line"><span class="prompt">lumina@craft</span><span class="cmd"> ~ % <span class="blink">&#x2588;</span></span></div>
</div>`;
