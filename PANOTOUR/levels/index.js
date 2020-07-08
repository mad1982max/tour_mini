console.log(navigator.userAgent);
let changeRatioManualy = 175; //y from 1494px to 1650px in orig image
let fontSize = 28;
let pinScale = 1.3;


let floorSrc, level, coverSrc, set1, dragged = false;
defineData4Floor();
window.addEventListener('load', loadedFn);

let setFlagObj = {
    cover: false,
    set1: false,
    set2: false
}
let headerFooterHeight = document.querySelector('.header').offsetHeight + document.querySelector('.footer').offsetHeight;

let canvas = document.getElementsByTagName('canvas')[0];
let ctx = canvas.getContext('2d');
let plan = new Image;
let coverGrey = new Image;
let cover = new Image;
let pinRed = new Image;
let pinGreen = new Image;
pinRed.src = './img/redPin_.png';
coverGrey.src = coverSrc;
pinGreen.src = './img/greenPin.png';
plan.src = floorSrc;
let pinsToClick = [];
let markList;
let pointedPano = 0;
let inLink = false;
let pin, pt, width, height, shiftToCentre, shiftToCentreY, scale = 1;
let globalAlpha = 0.8;
let lastX = canvas.width / 2, lastY = canvas.height / 2;
let dragStart;
let scaleFactor = 1.1;

//set 2 only for testing
let set2 = [{
        x: 1050,
        y: 185,
        id: 'test'
    },
    {
        x: 1846,
        y: 206,
        id: 'test'
    },
    {
        x: 1900,
        y: 350,
        id: 'test'
    },
    {
        x: 2000,
        y: 1230,
        id: 'test'
    }
];

function defineData4Floor() {
    let paramsString = window.location.search;
    let searchParams = new URLSearchParams(paramsString);
    level = searchParams.get("level");
    floorSrc = `./img/${level}.png`
    coverSrc = `./img/${level}_coverGrey.gif`;
    set1 = dataPin[level];
    console.log(floorSrc, coverSrc, set1.length);
}

function loadedFn() {

    let checkBoxArr = [...document.querySelectorAll('.form-check-input')];
    checkBoxArr.forEach(box => {
        setFlagObj[box.id] = box.checked;
        box.addEventListener('change', (e) => checkBoxListener(e))
    });
    canvas.addEventListener('mousedown', mousedownFn, false);
    canvas.addEventListener('mousemove', mousemoveFn, false);
    canvas.addEventListener('mouseup', mouseupFN, false);
    canvas.addEventListener('DOMMouseScroll', handleScroll, false);
    canvas.addEventListener('mousewheel', handleScroll, false);
    canvas.addEventListener('click', on_click, false);
    canvas.addEventListener("touchstart", (evt) => {
        evt.preventDefault();
        mousedownFn(evt);
        var touches = evt.changedTouches;
        
    }, false);
    canvas.addEventListener("touchend", mouseupFN, false);
    canvas.addEventListener("touchmove", mousemoveFn, false);


    window.addEventListener('resize', resizeFn);
    resizeFn();

    function resizeFn() {
        trackTransforms(ctx);
        width = window.innerWidth ||
            document.documentElement.clientWidth ||
            document.body.clientWidth;

        height = window.innerHeight ||
            document.documentElement.clientHeight ||
            document.body.clientHeight;

        canvas.width = width;
        canvas.height = height - headerFooterHeight;
        let planRatio = plan.width / plan.height;

        if (planRatio > width / height) {
            scale = 0.85 * canvas.width / plan.width;
        } else {
            scale = 0.85 * canvas.height / plan.height;
        }

        shiftToCentre = (canvas.width - scale * plan.width) / (scale * 2);
        shiftToCentreY = (canvas.height - scale * plan.height) / (scale * 2);
        ctx.scale(scale, scale);
        redraw();
    }

    function definePinsToShow() {
        if (setFlagObj.set1 && setFlagObj.set2) {
            pinsToClick = [...set1, ...set2];
            return;
        } else if (setFlagObj.set1) {
            pinsToClick = set1;
            return;
        } else if (setFlagObj.set2) {
            pinsToClick = set2;
            return
        } else {
            pinsToClick = [];
        }
    }

    function checkBoxListener(e) {
        canvas.removeEventListener('mousemove', makePinsClicable, false);
        let infoToShow = e.target.id;
        setFlagObj[infoToShow] = !setFlagObj[infoToShow];
        redraw();
    }

    function makePinsClicable() {
        let markList = pinsToClick;
        let pw = pinScale * pin.width * 0.55 * 0.04;
        let ph = pinScale * pin.height * 0.03;

        for (let i = 0; i < markList.length; i++) {
            let px = markList[i].x - pw / 2 + shiftToCentre;
            let py = markList[i].y - ph + changeRatioManualy + shiftToCentreY;

            if (pt && pt.x >= px && pt.x <= (px + pw) && pt.y >= py && pt.y <= (py + ph)) {
                document.body.style.cursor = "pointer";
                pointedPano = markList[i].id;
                inLink = true;
                console.log('point', pointedPano);
                break;
            } else {
                document.body.style.cursor = "";
                pointedPano = null;
                inLink = false;
            }
        }
    }

    function drawSet(set, flag) {
        let fontColor;
        if (set === 'set1') {
            pin = pinRed;
            fontColor = 'white';
            markList = set1;
        } else {
            fontColor = 'black'
            pin = pinGreen;
            markList = set2;
        }

        if (setFlagObj.set1 || setFlagObj.set2) {
            canvas.addEventListener('mousemove', makePinsClicable, false);
        }

        if (flag) {
            ctx.globalAlpha = 1;
            let fs = fontSize;
            ctx.font = fs + 'px sans-serif';
            ctx.fillStyle = fontColor;

            for (let i = 0; i < markList.length; i++) {

                let pw = pinScale * pin.width;
                let ph = pinScale * pin.height;
                let px = markList[i].x - pw / 2 + shiftToCentre;
                let py = markList[i].y + changeRatioManualy - ph + shiftToCentreY;
                ctx.drawImage(pin, px, py, pw, ph);
                let idW = ctx.measureText(markList[i].id).width;
                ctx.fillText(markList[i].id, markList[i].x - idW / 2 + shiftToCentre, markList[i].y - 0.58 * ph + shiftToCentreY + changeRatioManualy);
            }
        }
    }

    // function coverChooser() {
    //     if(setFlagObj.set1 && setFlagObj.set2) {
    //         cover = coverGreyMix;
    //     } else {
    //         if(setFlagObj.set1) cover = coverGreyRed;
    //         if(setFlagObj.set2) cover = coverGreyGreen;
    //     } 
    //     return cover;
    // }

    function drawLawer(bool) {
        if (bool) {
            // cover = coverChooser();
            // if (!setFlagObj.set1 && !setFlagObj.set2) cover = coverGrey
            cover = coverGrey;
            ctx.globalAlpha = globalAlpha;
            ctx.drawImage(cover, shiftToCentre, shiftToCentreY, cover.width, cover.height);
        }
    }

    function checkSets() {
        definePinsToShow();
        for (let key in setFlagObj) {
            switch (key) {
                case 'cover':
                    drawLawer(setFlagObj[key])
                    break;
                case 'set1':
                case 'set2':
                    drawSet(key, setFlagObj[key]);
                    break;
                default:
                    console.log('some error in drawSet');
            }
        }
    }

    function clearCanvas() {
        let p1 = ctx.transformedPoint(0, 0);
        let p2 = ctx.transformedPoint(canvas.width, canvas.height);
        ctx.clearRect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);
    }

    function redraw() {
        clearCanvas();
        ctx.globalAlpha = 1;
        ctx.drawImage(plan, shiftToCentre, shiftToCentreY);
        canvas.removeEventListener('mousemove', makePinsClicable, false);
        checkSets();
    }    

    function mousedownFn(evt) {
        document.body.style.mozUserSelect = document.body.style.webkitUserSelect = document.body.style.userSelect = 'none';
        lastX = evt.offsetX || (evt.pageX - canvas.offsetLeft) || evt.touches[0].clientX;
        lastY = evt.offsetY || (evt.pageY - canvas.offsetTop)  || evt.touches[0].clientY;
        dragStart = ctx.transformedPoint(lastX, lastY);
        dragged = false;
    }

    function mousemoveFn(evt) {
        lastX = evt.offsetX || (evt.pageX - canvas.offsetLeft) || evt.touches[0].clientX;
        lastY = evt.offsetY || (evt.pageY - canvas.offsetTop) || evt.touches[0].clientY;
        dragged = true;
        pt = ctx.transformedPoint(lastX, lastY);
        if (dragStart) {
            ctx.translate(pt.x - dragStart.x, pt.y - dragStart.y);
            redraw();
        }
    }

    function mouseupFN(evt) {
        dragStart = null;
    }    

    function on_click(e) {
        if (inLink) {
            window.open("../PANOS/mainPointCloud.html?level=" + level + "&name=" + pointedPano, "_self");
        }
    }
    
    function zoom(delta) {
        let pt = ctx.transformedPoint(lastX, lastY);
        ctx.translate(pt.x, pt.y);
        let factor = Math.pow(scaleFactor, delta);
        ctx.scale(factor, factor);
        ctx.translate(-pt.x, -pt.y);
        scale *= factor;
        redraw();
    }

    function handleScroll(evt) {
        let delta = evt.wheelDelta ? evt.wheelDelta / 40 : evt.detail ? -evt.detail : 0;
        if (delta) zoom(delta);
        return evt.preventDefault() && false;
    }
};

function trackTransforms(ctx) {
    let svg = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
    let xform = svg.createSVGMatrix();

    ctx.getTransform = function () {
        return xform;
    };
    let savedTransforms = [];
    let save = ctx.save;
    ctx.save = function () {
        savedTransforms.push(xform.translate(0, 0));
        return save.call(ctx);
    };
    let restore = ctx.restore;
    ctx.restore = function () {
        xform = savedTransforms.pop();
        return restore.call(ctx);
    };
    let scale = ctx.scale;
    ctx.scale = function (sx, sy) {
        xform = xform.scaleNonUniform(sx, sy);
        return scale.call(ctx, sx, sy);
    };
    let rotate = ctx.rotate;
    ctx.rotate = function (radians) {
        xform = xform.rotate(radians * 180 / Math.PI);
        return rotate.call(ctx, radians);
    };
    let translate = ctx.translate;
    ctx.translate = function (dx, dy) {
        xform = xform.translate(dx, dy);
        return translate.call(ctx, dx, dy);
    };
    let transform = ctx.transform;
    ctx.transform = function (a, b, c, d, e, f) {
        let m2 = svg.createSVGMatrix();
        m2.a = a;
        m2.b = b;
        m2.c = c;
        m2.d = d;
        m2.e = e;
        m2.f = f;
        xform = xform.multiply(m2);
        return transform.call(ctx, a, b, c, d, e, f);
    };
    let setTransform = ctx.setTransform;
    ctx.setTransform = function (a, b, c, d, e, f) {
        xform.a = a;
        xform.b = b;
        xform.c = c;
        xform.d = d;
        xform.e = e;
        xform.f = f;
        return setTransform.call(ctx, a, b, c, d, e, f);
    };
    let pt = svg.createSVGPoint();
    ctx.transformedPoint = function (x, y) {
        pt.x = x;
        pt.y = y;
        return pt.matrixTransform(xform.inverse());
    }
}