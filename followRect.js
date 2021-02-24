var FollowRect = function () {
    var canvas = null;
    var ctx = null;
    var canvasWidth = null;
    var canvasHeight = null;

    var visual = { // 观察点坐标
        x: 0,
        y: 0,
        z: 800
    }

    var rectangleSpace = 80 // 默认矩形间距
    var rotationAngle = 0.5 // 旋转角度
    var maps = []

    /**
     * 三维坐标转二维坐标
     * @param {三维X轴} x 
     * @param {三维Y轴} y 
     * @param {三维Z轴} z 
     * @param {X轴偏移，数值为canvas的长度的一半} offsetX 
     * @param {Y轴偏移，数值为canvas的高度的一半} offsetY 
     */
    var transformCoordinatePoint = function (x, y, z, offsetX = canvasWidth / 2, offsetY = canvasHeight / 2) {
        return {
            x: (x - visual.x) * visual.z / (visual.z - z) + offsetX,
            y: (y - visual.y) * visual.z / (visual.z - z) + offsetY
        }
    }

    this.init = function (el) {
        canvas = typeof el === 'object' ? el : document.getElementById(el)
        canvasWidth = canvas.width;
        canvasHeight = canvas.height;
        // rectangleSpace = (canvas.width - 400) / 2 / 8

        ctx = canvas.getContext('2d')

        this.createRectangle()
        this.batchDraw()
        this.addEventListener()
    };

    /**
     * 定义画笔参数
     * @param {矩形参数} obj 
     */
    this.draw = function (obj) {

        var point;
        ctx.strokeStyle = obj.rgba

        ctx.beginPath()
        point = transformCoordinatePoint(...obj.A)
        ctx.moveTo(point.x, point.y)
        point = transformCoordinatePoint(...obj.B)
        ctx.lineTo(point.x, point.y)
        point = transformCoordinatePoint(...obj.C)
        ctx.lineTo(point.x, point.y)
        point = transformCoordinatePoint(...obj.D)
        ctx.lineTo(point.x, point.y)
        ctx.closePath()
        ctx.stroke()
    }

    this.addEventListener = function () { // 添加鼠标监听事件
        this.mousemove()
        this.mouseleave()
    }

    this.mousemove = function () { // 监听鼠标移动
        var _this = this
        canvas.addEventListener("mousemove", function (e) {
            if (e.movementX > 0) { //向右
                rotationAngle = Math.abs(rotationAngle)
                if( maps[8].D[0] > 75 ){
                    return
                }
            }
            if (e.movementX < 0) { //向左
                rotationAngle = -Math.abs(rotationAngle)
                if( maps[8].D[0] < -75 ){
                    return
                }
            }

            ctx.clearRect(0, 0, canvasWidth, canvasHeight)
            _this.rotate()
            _this.batchDraw()
        })
    }

    this.mouseleave = function () { // 监听鼠标离开
        var _this = this
        canvas.addEventListener("mouseleave", function (e) {
            _this.reset()
        })
    }

    this.reset = function () { // 重置位置
        var _this = this;
        var time = setInterval(() => {
            if (maps[8].D[0] < -1) {
                rotationAngle = Math.abs(rotationAngle)
            }
            if (maps[8].D[0] > 1) {
                rotationAngle = -Math.abs(rotationAngle)
            }
            if (maps[8].D[0] < 1 && maps[8].D[0] > -1) {
                clearInterval(time)
            }
            ctx.clearRect(0, 0, canvasWidth, canvasHeight)
            _this.rotate()
            _this.batchDraw()
        }, 2);
    }

    this.setRectangle = function (x, idx) { // 设置矩形坐标、样式
        //  [ x轴，y轴，z轴 ] A B 向内，D C向外
        // D  A 
        // C  B
        var z = 400
        var rectangle = {}
        rectangle.A = [x, -(canvasHeight / 2 - canvasHeight * 0.2), -z / 2]
        rectangle.B = [x, (canvasHeight / 2 - canvasHeight * 0.2), -z / 2]
        rectangle.C = [x, (canvasHeight / 2 - canvasHeight * 0.2), z / 2]
        rectangle.D = [x, -(canvasHeight / 2 - canvasHeight * 0.2), z / 2]
        rectangle.startX = x
        rectangle.offsetX = 0

        if (idx == 0) {
            rectangle.rgba = 'rgba(241,141,0,1)'
        } else {
            rectangle.rgba = 'rgba(241,141,0,' + (1 - idx / 10) + ')'
        }

        return rectangle
    }

    // 创建矩形图
    this.createRectangle = function () {
        maps.push(this.setRectangle(0, 0))
        for (var i = 1; i < 9; i++) {
            maps.push(this.setRectangle(i * rectangleSpace, i))
            maps.unshift(this.setRectangle(-i * rectangleSpace, i))
        }
    }

    // 遍历矩形图，并绘画
    this.batchDraw = function () {
        for (var i = 0; i < maps.length; i++) {
            this.draw(maps[i])
        }
    }

    // 旋转图形
    this.rotate = function () {
        maps.forEach(item => {
            var mapitem = item
            for (var key in mapitem) {
                if (!(mapitem[key] instanceof Array)) {
                    mapitem.offsetX = mapitem.startX
                    break
                }

                var point = mapitem[key]
                var x, y, z;
                y = point[1]
                z = point[2]
                if (mapitem.offsetX == 0) {
                    x = point[0]
                    // 变换后的x坐标
                    point[0] = ((x - mapitem.startX) * Math.cos(rotationAngle / 180 * Math.PI) + z * Math.sin(rotationAngle / 180 * Math.PI)) - mapitem.startX
                    // 变换后的z坐标
                    point[2] = z * Math.cos(rotationAngle / 180 * Math.PI) - (x - mapitem.startX) * Math.sin(rotationAngle / 180 * Math.PI)
                } else {
                    x = point[0] + mapitem.startX
                    // 变换后的x坐标
                    point[0] = x * Math.cos(rotationAngle / 180 * Math.PI) + z * Math.sin(rotationAngle / 180 * Math.PI) - mapitem.startX
                    // 变换后的z坐标
                    point[2] = z * Math.cos(rotationAngle / 180 * Math.PI) - x * Math.sin(rotationAngle / 180 * Math.PI)
                }
                // 绕y轴旋转，y左边不会发生变化
                point[1] = y
            }
        });
    }
}


var myCanvas = new FollowRect()
myCanvas.init('myCanvas')