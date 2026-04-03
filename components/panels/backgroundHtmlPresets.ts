export type HtmlBackgroundPreset = {
  name: string;
  html: string;
};

export const HTML_PRESETS: HtmlBackgroundPreset[] = [
  {
    name: '动态时钟',
    html: String.raw`<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Minimalist Dynamic Clock Background</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            background-color: #fafafa;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            overflow: hidden;
            color: #333;
        }

        #clock-container {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            z-index: -1;
            pointer-events: none;
        }

        text {
            user-select: none;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }
    </style>
</head>
<body>
    <svg id="clock-container">
        <g id="main-group">
            <g id="static-group"></g>
            <g id="hours-group"></g>
            <g id="mins-group"></g>
            <g id="secs-group"></g>
            <g id="pointer-group"></g>
        </g>
    </svg>

    <script>
        const rInner = 400;
        const rHours = 550;
        const rDiv1  = 700;
        const rMins  = 850;
        const rDiv2  = 980;
        const rSecs  = 1080;
        const rOuter = 1150;

        const mainGroup = document.getElementById('main-group');
        const staticGroup = document.getElementById('static-group');
        const hoursGroup = document.getElementById('hours-group');
        const minsGroup = document.getElementById('mins-group');
        const secsGroup = document.getElementById('secs-group');
        const pointerGroup = document.getElementById('pointer-group');

        // 绘制静态圆环
        function createCircle(r) {
            const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            c.setAttribute("r", r);
            c.setAttribute("fill", "none");
            c.setAttribute("stroke", "#e8e8e8");
            c.setAttribute("stroke-width", "1.5");
            staticGroup.appendChild(c);
        }
        [rInner, rDiv1, rDiv2, rOuter].forEach(createCircle);

        // 1. 小时刻度
        for (let i = 1; i <= 12; i++) {
            let angle = i * 30;
            let displayNum = i === 0 ? 12 : i;

            let text = document.createElementNS("http://www.w3.org/2000/svg", "text");
            text.textContent = displayNum;
            text.setAttribute("x", 0);
            text.setAttribute("y", -rHours);
            text.setAttribute("text-anchor", "middle");
            text.setAttribute("dominant-baseline", "central");
            text.setAttribute("font-size", "140px");
            text.setAttribute("font-weight", "800");
            text.setAttribute("fill", "#444");
            text.setAttribute("transform", "rotate(" + angle + ")");
            hoursGroup.appendChild(text);

            let tick = document.createElementNS("http://www.w3.org/2000/svg", "line");
            tick.setAttribute("x1", 0);
            tick.setAttribute("y1", -rDiv1);
            tick.setAttribute("x2", 0);
            tick.setAttribute("y2", -rDiv1 + 15);
            tick.setAttribute("stroke", "#ccc");
            tick.setAttribute("stroke-width", "3");
            tick.setAttribute("transform", "rotate(" + angle + ")");
            staticGroup.appendChild(tick);
        }

        // 2. 分钟刻度
        for (let i = 0; i < 60; i++) {
            let angle = i * 6;
            if (i % 5 === 0) {
                let text = document.createElementNS("http://www.w3.org/2000/svg", "text");
                text.textContent = i;
                text.setAttribute("x", 0);
                text.setAttribute("y", -rMins);
                text.setAttribute("text-anchor", "middle");
                text.setAttribute("dominant-baseline", "central");
                text.setAttribute("font-size", "70px");
                text.setAttribute("font-weight", "700");
                text.setAttribute("fill", "#999");
                text.setAttribute("transform", "rotate(" + angle + ")");
                minsGroup.appendChild(text);
            } else {
                let tick = document.createElementNS("http://www.w3.org/2000/svg", "line");
                tick.setAttribute("x1", 0);
                tick.setAttribute("y1", -rMins - 20);
                tick.setAttribute("x2", 0);
                tick.setAttribute("y2", -rMins + 20);
                tick.setAttribute("stroke", "#e0e0e0");
                tick.setAttribute("stroke-width", "2");
                tick.setAttribute("transform", "rotate(" + angle + ")");
                minsGroup.appendChild(tick);
            }
        }

        // 3. 秒钟刻度及数字
        for (let i = 0; i < 60; i++) {
            let angle = i * 6;
            let isThick = i % 5 === 0;
            let tickLength = isThick ? 25 : 12;
            let strokeWidth = isThick ? 3 : 1.5;
            let strokeCol = isThick ? "#bbb" : "#ddd";

            let tick = document.createElementNS("http://www.w3.org/2000/svg", "line");
            tick.setAttribute("x1", 0);
            tick.setAttribute("y1", -rSecs);
            tick.setAttribute("x2", 0);
            tick.setAttribute("y2", -rSecs + tickLength);
            tick.setAttribute("stroke", strokeCol);
            tick.setAttribute("stroke-width", strokeWidth);
            tick.setAttribute("transform", "rotate(" + angle + ")");
            secsGroup.appendChild(tick);

            // 在粗指针下方添加具体秒数文本
            if (isThick) {
                let secText = document.createElementNS("http://www.w3.org/2000/svg", "text");
                secText.textContent = i;
                secText.setAttribute("x", 0);
                secText.setAttribute("y", -rSecs + 55);
                secText.setAttribute("text-anchor", "middle");
                secText.setAttribute("dominant-baseline", "central");
                secText.setAttribute("font-size", "28px");
                secText.setAttribute("font-weight", "600");
                secText.setAttribute("fill", "#bbb");
                secText.setAttribute("transform", "rotate(" + angle + ")");
                secsGroup.appendChild(secText);
            }
        }

        // 4. 绘制固定指针与平行文本
        const pointerAngle = -45;

        let pLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
        pLine.setAttribute("x1", 0);
        pLine.setAttribute("y1", 0);
        pLine.setAttribute("x2", 0);
        pLine.setAttribute("y2", -rOuter - 100);
        pLine.setAttribute("stroke", "#a0a0a0");
        pLine.setAttribute("stroke-width", "1.5");
        pLine.setAttribute("transform", "rotate(" + pointerAngle + ")");
        pointerGroup.appendChild(pLine);

        let pText = document.createElementNS("http://www.w3.org/2000/svg", "text");
        pText.textContent = "UTC+8";
        pText.setAttribute("font-size", "14px");
        pText.setAttribute("font-weight", "600");
        pText.setAttribute("fill", "#888");
        pText.setAttribute("letter-spacing", "1px");

        // 【修改锚点】从 start 开始，意味着文字会从外侧顶点向圆心方向自然阅读
        pText.setAttribute("text-anchor", "start");
        pText.setAttribute("dominant-baseline", "central");

        // 【关键修改】将末尾的 rotate(-90) 改为了 rotate(90)，文字就会在右侧正过来
        pText.setAttribute("transform", "rotate(" + pointerAngle + ") translate(16, " + (-rOuter - 100) + ") rotate(90)");
        pointerGroup.appendChild(pText);

        // 自适应屏幕
        function handleResize() {
            const width = document.documentElement.clientWidth || window.innerWidth || 0;
            const height = document.documentElement.clientHeight || window.innerHeight || 0;

            if (!width || !height) {
                requestAnimationFrame(handleResize);
                return;
            }

            const cx = width + 120;
            const cy = height + 120;
            mainGroup.setAttribute("transform", "translate(" + cx + ", " + cy + ")");
        }
        window.addEventListener('resize', handleResize);
        window.addEventListener('load', handleResize);
        requestAnimationFrame(function () {
            requestAnimationFrame(handleResize);
        });

        // 5. 核心动态旋转逻辑
        function updateClock() {
            const now = new Date();
            const ms = now.getMilliseconds();
            const s = now.getSeconds();
            const m = now.getMinutes();
            const h = now.getHours();

            const secVal = s + ms / 1000;
            const minVal = m + secVal / 60;
            const hourVal = (h % 12) + minVal / 60;

            const rotSecs = pointerAngle - secVal * 6;
            const rotMins = pointerAngle - minVal * 6;
            const rotHours = pointerAngle - hourVal * 30;

            secsGroup.setAttribute("transform", "rotate(" + rotSecs + ")");
            minsGroup.setAttribute("transform", "rotate(" + rotMins + ")");
            hoursGroup.setAttribute("transform", "rotate(" + rotHours + ")");

            requestAnimationFrame(updateClock);
        }

        updateClock();
    </script>
</body>
</html>`,
  },
];

