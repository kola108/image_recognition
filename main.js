document.addEventListener('DOMContentLoaded', DOMLoaded, false);

function DOMLoaded(){

    function DCanvas(canvas) {
        const ctx = canvas.getContext('2d');
        const pixel = 20;

        let is_mouse_down = false;

        canvas.width = 500;
        canvas.height = 500;

        this.drawLine = (x1, y1, x2, y2, color = 'gray') => {
            ctx.beginPath();
            ctx.strokeStyle = color;
            ctx.lineJoin = 'miter';
            ctx.moveTo(x1,y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
        }

        this.drawCell = (x, y, w, h) => {
            ctx.fillStyle = 'blue';
            ctx.strokeStyle = 'blue';
            ctx.lineJoin = 'miter';
            ctx.rect(x, y, w, h);
            ctx.fill();
        }

        this.clear = () => ctx.clearRect(0,0, canvas.width, canvas.height);

        this.drawGrid = () => {
            const w = canvas.width;
            const h = canvas.height;
            const p = w / pixel;

            const xStep = w / p;
            const yStep = h / p;

            for (let x = 0; x < w; x += xStep) {
                this.drawLine(x,0,x,h);
            }

            for (let y = 0; y < h; y += yStep) {
                this.drawLine(0,y,w,y);
            }
        }

        this.calculate = (draw = false) => {
            const w = canvas.width;
            const h = canvas.height;
            const p = w / pixel;

            const xStep = w / p;
            const yStep = h / p;

            const vector = [];
            let _draw = [];

            for (let x = 0; x < w; x += xStep) {
                for (let y = 0; y < h; y += yStep) {
                    const data = ctx.getImageData(x,y,xStep,yStep);

                    let nonEmptyPixelsCount = 0;

                    for (let i = 0; i < data.data.length; i += 10) {

                        const isEmpty = data.data[i] === 0;

                        if (!isEmpty) {
                            nonEmptyPixelsCount += 1;
                        }
                    }

                    if (nonEmptyPixelsCount > 1 && draw) {
                        _draw.push([x,y,xStep,yStep]);
                    }

                    vector.push(nonEmptyPixelsCount > 1 ? 1 : 0);

                }
            }

            if (draw) {
                this.clear();
                this.drawGrid();

                for ( _d in _draw) {
                    this.drawCell(_draw[_d][0], _draw[_d][1], _draw[_d][2], _draw[_d][3])
                }
            }

            return vector;
        }

        canvas.addEventListener('mousedown', (e) => {
            is_mouse_down = true;
            ctx.beginPath();
        });

        canvas.addEventListener('mouseup', (e) => {
            is_mouse_down = false;
        });

        canvas.addEventListener('mousemove', (e) => {
            if ( is_mouse_down ) {
                ctx.fillStyle = 'red';
                ctx.strokeStyle = 'red';
                ctx.lineWidth = pixel;

                ctx.lineTo(e.offsetX, e.offsetY);
                ctx.stroke();

                ctx.beginPath();
                ctx.arc(e.offsetX, e.offsetY, pixel / 2, 0, Math.PI * 2);
                ctx.fill();

                ctx.beginPath();
                ctx.moveTo(e.offsetX, e.offsetY);
            }
        })

    }

    const clearBtn = document.getElementById('clear');
    const learnBtn = document.getElementById('learn');
    const recognizeBtn = document.getElementById('recognize');

    let vector = [];
    let net = null;
    let train_data = [];

    const d = new DCanvas(document.getElementById('canvas'));

    clearBtn.onclick = () => {
        d.clear();
    }

    learnBtn.onclick = () => {
        vector = d.calculate(true);

        const subject = prompt('what is it?');
        let subjectOutput = {};
        subjectOutput[subject] = 1;

        // network train
        train_data.push({
            input: vector,
            output: subjectOutput
        });
    }

    recognizeBtn.onclick = () => {
        net = new brain.NeuralNetwork();
        net.train(train_data);

        console.log(train_data);

        //network result
        const result = brain.likely(d.calculate(), net);
        alert(result);
    }


}