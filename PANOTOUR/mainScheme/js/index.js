let svg, floorRect, headerFooterHeight, obj;
obj = document.getElementById('svg');

obj.onload = function () {

    document.body.style.opacity = 1;
    let svgDocument = obj.contentDocument;
    resizeFn();
    window.addEventListener('resize', resizeFn);

    svg = svgDocument;

    floorRect = [...svgDocument.querySelectorAll(".block")];
    floorRect.forEach(singleBlock => {
        singleBlock.addEventListener('click', clickFloor)
        singleBlock.addEventListener('mouseenter', mouseOverFloor)
        singleBlock.addEventListener('mouseleave', mouseLeave)
    })
};

function resizeFn() {

    headerFooterHeight = document.querySelector('.header').offsetHeight + document.querySelector('.footer').offsetHeight;

    let h = window.innerHeight || document.documentElement.clientHeight ||
        document.body.clientHeight;

    let w = window.innerWidth || document.documentElement.clientWidth ||
        document.body.clientWidth;

    let hwRatio = h / w;
    let multer = hwRatio > 1.8 ? 0.7 : hwRatio <= 1 ? 1.2 : 0.8;
    obj.style.height = `${h*multer - headerFooterHeight*multer}px`;

}

function mouseLeave() {
    this.style.fill = "none";
    this.style.stroke = "none"
}

function mouseOverFloor() {
    this.style.fill = "rgba(0,0,0,0.2)";
    this.style.stroke = "#FFF773"
    this.style.strokeWidth = 8;
    this.style.cursor = "pointer";
}

function clickFloor(e) {
    let level = e.target.id;
    console.log('goTo: ', level);
    //window.location.href = `../levels/SITEMAP.html?level=${level}`; 
    //document.location.assign(`../levels/SITEMAP.html?level=${level}`);
    window.open(`../levels/SITEMAP.html?level=${level}`, "_self")
}