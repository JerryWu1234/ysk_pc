/**
 * Created by lhm on 2017/12/7.
 *
 * 编辑模式下 可能存在bug 不会影响预览模式的使用
 *
 *                     IntroduceGraph (global interface)
 *
 *                               Graph                                                stage
 *                                | (manage)
 *        Activity                            Transition                              layer
 *          | (manage)                              |  (manage)
 *   [ActivityCtrl,ActivityCtrl...]     [TransitionCtrl,TransitionCtrl...]            group
 *
 */

!function ($, $_, window, undefined) {

    var $window = $(window);

    function IntroduceGraph(settings) {
        this.Settings = settings;
        this.data = settings.data
    }

    IntroduceGraph.prototype = {
        constructor: IntroduceGraph,

        render: function () {
            this.Graph && this.Graph.destroy();
            var components = [
                Activity,
                Transition
            ];

            this.Graph = new Graph(this.Settings.renderTo, this, this.Settings, components);
            this.Graph.Draw(this.data)
        },

        on: function (evt, callback) {
            $window.on(evt, callback);
            return this
        }
    };

    function Activity() {
        this.type = "activity";
        this.ItemControls = [];
    }

    Activity.prototype = {
        constructor: Activity,

        init: function (designer) {
            this.designer = designer;
            this.Layer = new $_.Layer;
            this.designer.Stage.add(this.Layer);
            this.Layer.setZIndex(5);
        },

        draw: function () {
            this.ItemControls && this.ItemControls.forEach(function (itemControl) {
                itemControl.control.destroy()
            });

            this.ItemControls = [];
            var this$ = this;

            var transitionManager = this$.designer.GetComponentByType("transition");

            undefined !== this.designer.data &&
            this.designer.data.forEach(function (item, index) {
                var x, y;

                if ("" !== item.x && "" !== item.y) {
                    x = parseInt(item.x);
                    y = parseInt(item.y);
                } else {
                    x = 100;
                    y = 100
                }

                var activityControl = new ActivityControl({
                    index: index,
                    x: x,
                    y: y,
                    item: item,
                    designer: this$.designer,
                    manager: this$
                });

                this$.ItemControls.push(activityControl);

                var transitionCtrl = new TransitionControl({
                    manager: transitionManager,
                    item: item.transition,
                    activityCtrl: activityControl,
                    designer: this$.designer
                });

                var transitionManger = this$.designer.GetComponentByType("transition");
                transitionManger.ItemControls.push(transitionCtrl);

                activityControl.draw();
                transitionCtrl.draw();
                activityControl.sync()
            });
            this.Layer.batchDraw();
            transitionManager.batchDraw()
        }
    };

    function ActivityControl(options) {
        this.index = options.index;
        this.options = options;
        this.manager = options.manager;
        this.designer = options.designer;
        this.x = options.x;
        this.y = options.y;
        this.item = options.item;
        this.control = void 0;
        this.circle = void 0;
        this.text = void 0;
        this.dependentTransition = void 0
    }

    ActivityControl.prototype = {
        constructor: ActivityControl,

        getColor: function () {
            return "#EB6502"
        },

        draw: function () {
            // var settings = this.designer.Settings; //这行代码别删 暂时没用到
            this.control = new $_.Group({
                x: this.options.x,
                y: this.options.y,
                rotation: 0,
                draggable: !this.designer.Settings.preview
            });

            this.circle = new $_.Circle({
                x: 0,
                y: 0,
                radius: 10,
                fill: this.getColor(),
                opacity: .6
            });

            //this.plusCross = new $_.Rect({
            //    x: -7,
            //    y: -1,
            //    height: 2,
            //    width: 14,
            //    fill: "#fff"
            //});
            //
            //this.plusVertical = new $_.Rect({
            //    x: -1,
            //    y: -7,
            //    height: 14,
            //    width: 2,
            //    fill: "#fff"
            //});

            var i = ++this.index;

            this.text = new $_.Text({
                x: i > 9 ? -7 : -3,
                y: -7,
                text: i.toString(),
                fontSize: 12,
                fontFamily: "Calibri",
                fontStyle: "bold",
                fill: "#fff"
            });

            this.control.add(this.circle);
            this.control.add(this.text);
            //this.control.add(this.plusCross);
            //this.control.add(this.plusVertical);

            var transitionManger = this.designer.GetComponentByType("transition");

            if (!this.designer.Settings.preview) {
                this.control.on("dragmove", function () {
                    this.dependentTransition && this.dependentTransition.draw();
                    transitionManger.batchDraw()
                }.bind(this));

                this.control.on("dragend", this.sync.bind(this));
            } else {
                this.control.on("touchend", function () {
                    //transitionManger.setVisible(false);
                    //this.dependentTransition.control.setVisible(true);
                    $window.trigger("activityClick", this.index);
                    transitionManger.batchDraw()
                }.bind(this));
            }

            this.manager.Layer.add(this.control);
        },

        RegisterTransition: function (dependentTransitionCtrl) {
            this.dependentTransition = dependentTransitionCtrl
        },

        getX: function () {
            return this.control.getPosition().x
        },

        getY: function () {
            return this.control.getPosition().y
        },

        sync: function () {
            undefined === this.item && (this.item = {});
            this.item.x = this.getX();
            this.item.y = this.getY()
        }
    };

    function Transition() {
        this.type = "transition";
        this.ItemControls = [];
    }

    Transition.prototype = {
        constructor: Transition,
        init: function (designer) {
            this.designer = designer;

            this.Layer = new $_.Layer;
            this.designer.Stage.add(this.Layer);
            this.Layer.setZIndex(1);

            this.APLayer = new $_.Layer;
            this.designer.Stage.add(this.APLayer);
            this.APLayer.setZIndex(3);
        },

        batchDraw: function () {
            this.Layer.batchDraw();
            this.APLayer.batchDraw()
        },

        setVisible: function (visible) {
            this.ItemControls.forEach(function (transitionControl) {
                transitionControl.control.setVisible(visible)
            })
        }
    };

    function TransitionControl(options) {
        this.manager = options.manager;
        this.designer = options.designer;
        this.activityCtrl = options.activityCtrl;

        this.item = options.item;
        this.to = this.item.to;
        this.bending = this.item.bending || 0;
        this.control = undefined;
        this.arrow = undefined;
        this.line = undefined;

        this.activityCtrl.RegisterTransition(this);
        this.start = undefined;
        this.end = undefined;
        this.middle = undefined;
        this.angle = undefined;
        this.lineAngle = undefined;
        this.activePoint = undefined;
        this.touchpoint = undefined;
    }

    TransitionControl.prototype = {
        constructor: TransitionControl,

        getColor: function () {
            return "#EB6502"
        },

        //获取弧线顶点算法
        _getCBPoint: function (fromX, fromY, toX, toY, lineAngle, lineLength, bending) {
            var toPositiveHandler, angle = lineAngle, len = lineLength;

            //如果角度小于90度 且大于0 得1  否则如果角度大于等于90度 得-1 再否则如果角度小于等于0且角度大于-90度 得-1  否则得1
            toPositiveHandler = angle < Math.PI / 2 && angle > 0 ? 1 :
                angle >= Math.PI / 2 ? -1 :
                    0 >= angle && angle > -Math.PI / 2 ? -1 : 1;

            toPositiveHandler = (angle > 0 ? 1 : -1) * toPositiveHandler;

            //chordLength  为弧线顶点到线的中线点的距离  把这个距离作为弦长计算出弧线顶点的坐标
            var chordLength = bending * len * toPositiveHandler,
                lineCenterX = (fromX + toX) / 2,
                lineCenterY = (fromY + toY) / 2,
                bezierCtrlX = lineCenterX - chordLength * Math.cos(Math.PI / 2 + angle),
                bezierCtrlY = lineCenterY - chordLength * Math.sin(Math.PI / 2 + angle);
            return {x: bezierCtrlX, y: bezierCtrlY}
        },

        drawTransition: function () {
            var
                fromX = this.activityCtrl.getX(),
                fromY = this.activityCtrl.getY(),
                toX = this.to.x,
                toY = this.to.y,
                bending = this.bending || 0;

            var
                lineAngle = Math.atan2(toY - fromY, toX - fromX),
                lineLength = this._getLineLength(fromX, fromY, toX, toY);

            var bezierCtrl = this._getCBPoint(fromX, fromY, toX, toY, lineAngle, lineLength, bending);

            var
                bezierCtrlX = bezierCtrl.x,
                bezierCtrlY = bezierCtrl.y,
                tension = .5;
            var arrowAngle = Math.atan2(toY - bezierCtrlY, toX - bezierCtrlX);
            var arrowAngleOffset = Math.PI / 10 * ( bending > 0 ? 1 : 0 > bending ? -1 : 0);
            Math.abs(lineAngle) >= Math.PI / 2 && (arrowAngleOffset = -arrowAngleOffset);

            arrowAngle += arrowAngleOffset;

            var color = this.getColor();

            this.start = {x: fromX, y: fromY};
            this.end = {x: toX, y: toY};

            this.middle = {
                x: bezierCtrlX,
                y: bezierCtrlY
            };

            this.angle = arrowAngle;
            this.lineAngle = lineAngle;

            if (this.control) {

                Common.updateArrowByAngle(this.arrow, toX, toY, arrowAngle, 15, color);
                this.line.setPoints([fromX, fromY, bezierCtrlX, bezierCtrlY, toX, toY]);
                this.line.setTension(tension)

            } else {
                this.control = new $_.Group({
                    x: 0,
                    y: 0,
                    rotation: 0
                });

                this.arrow = Common.createArrowByAngle(toX, toY, arrowAngle, 15, color);

                var lineOptions = {
                    points: [fromX, fromY, bezierCtrlX, bezierCtrlY, toX, toY],
                    stroke: color,
                    strokeWidth: 1,
                    lineCap: "round",
                    lineJoin: "round",
                    tension: tension
                };

                this.line = new $_.Line(lineOptions);
                this.control.add(this.line);
                this.control.add(this.arrow);
                this.control.setVisible(!this.designer.Settings.preview);
                this.manager.Layer.add(this.control)
            }
        },

        _moveTouchPoints: function (touchpoint, x, y) {
            touchpoint.setPosition({
                x: x,
                y: y
            });

            touchpoint.circle.setPosition({
                x: 0,
                y: 0
            })
        },

        _moveActivePoint: function (x, y) {
            this.activePoint.setPosition({x: x, y: y})
        },

        drawActivePoint: function () {
            if (this.activePoint)
                return this._moveActivePoint(this.middle.x, this.middle.y);

            var activePoint = this._createActivePoint(this.middle.x, this.middle.y, this.control);
            this.manager.APLayer.add(activePoint);
            this.activePoint = activePoint
        },

        drawTouchPoints: function () {
            if (this.touchpoint)
                return this._moveTouchPoints(this.touchpoint, this.end.x, this.end.y);

            var endTouchPoint = this._createTouchPoint(this.end.x, this.end.y, this.control);
            this.manager.APLayer.add(endTouchPoint);
            this.touchpoint = endTouchPoint
        },

        draw: function () {
            this.drawTransition();
            if (!this.designer.Settings.preview) {
                this.drawActivePoint();
                this.drawTouchPoints();
            }
        },

        _createTouchPoint: function (x, y, transition) {
            var
                this$ = this,
                control = new $_.Group({
                    x: x,
                    y: y,
                    draggable: !this.designer.Settings.preview
                });

            var touchPoint = new $_.Circle({
                x: 0,
                y: 0,
                radius: 5,
                fill: "lightgray"
            });

            control.add(touchPoint);
            control.circle = touchPoint;
            control.transition = transition;

            control.on("dragmove", function () {
                undefined === this$.oldbending && (this$.oldbending = this$.bending);
                // this$.bending = 0;
                this$.drawTransition();

                this$.drawActivePoint();
                this$.manager.batchDraw()
            });

            control.on("dragend", function () {
                var position = touchPoint.getAbsolutePosition();
                this$.to.x = position.x;
                this$.to.y = position.y;
                this$.bending = this$.oldbending;
                this$.oldbending = undefined;

                this$.draw();
                this$.manager.batchDraw()
            });

            return control
        },

        _createActivePoint: function (middleX, middleY, control) {
            var
                this$ = this,
                group = new $_.Group({
                    x: middleX,
                    y: middleY,
                    rotation: 0,
                    draggable: !this.designer.Settings.preview
                }),

                bezierControl = new $_.Circle({
                    x: 0,
                    y: 0,
                    radius: 5,
                    fill: "lightgray"
                });

            group.add(bezierControl);

            group.transition = control;

            var ondrag = function (sync, restBending) {
                var position = group.getPosition();
                restBending ?
                    this$.bending = 0 :
                    this$.bending = this$._getBending(
                        this$.start.x,
                        this$.start.y,
                        this$.end.x,
                        this$.end.y,
                        position.x,
                        position.y
                    );

                Math.abs(this$.bending) < .07 && (this$.bending = 0);
                this$.drawTransition();
                this$.drawTouchPoints();

                if (sync) {
                    this$.drawActivePoint();
                    this$.Sync()
                }

                this$.manager.batchDraw()
            };

            group.on("dragmove", function () {
                ondrag(false)
            });

            group.on("dragend", function () {
                ondrag(true)
            });

            return group
        },

        _getLineLength: function (startX, startY, endX, endY) {
            return Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2))
        },

        _getBending: function (startX, startY, endX, endY, bezierCtrlX, bezierCtrlY) {
            //                                                    相似三角
            //                                                    c/a  = (c+d)/b
            //                                                        c   d
            //                                                    \—————————|  
            //                                                     \     |  |
            //                                                      \   a|  |
            //                                                       \   |  | b
            //                                                    line\  |  |
            //                                                         \ |  |
            //                                                          \|  |
            //                                                           \  |
            //                                                            \ |
            //                                                             \|
            //
            var diffY = startY - endY,
                diffX = endX - startX,
                temporary = startX * endY - endX * startY;

            if (0 >= diffX) {   //如果 结束点 在开始点的左侧
                diffY = -diffY;
                diffX = -diffX;
                temporary = -temporary
            }

            // 开始点 (x1 已知 , y1 已知) 结束点(x2 已知 ,y2 已知) 线上的移动点(x3 控制点的X坐标 ,y3 未知需计算)
            // 如果 结束点 在开始点的右侧
            //  (x2 - x1)/(y2 - y1) = (x3 - x1)/(y3 - y1)
            // 最后 变形后简化 y3 = -(x1*y2 - x2*y1 + (y2 - y1) * x3 ) / (x2 - x1)

            // 替换变量后  y3 = -(temporary + diffY * bezierCtrlX) / diffX

            var y3 = -(temporary + diffY * bezierCtrlX) / diffX,
                c = bezierCtrlY > y3 ? -1 : 1,
                lineLength = this._getLineLength(startX, startY, endX, endY),
                middleX = (startX + endX) / 2,
                middleY = (startY + endY) / 2,
                lengthBetweenBezierCtrlAndLine = this._getLineLength(middleX, middleY, bezierCtrlX, bezierCtrlY),
                bending = lengthBetweenBezierCtrlAndLine / lineLength * c;

            0 === diffX && (bending = -bending);
            return bending
        },

        Sync: function () {
            this.item.bending = this.bending
        },

        destroy: function () {
            this.control.destroy();
            this.activePoint.destroy();
            this.touchpoints.forEach(function (point) {
                point.destroy()
            })
        }
    };

    function Background() {

    }

    function Graph(renderTo, designer, settings, components) {
        this.container = renderTo;
        this.designer = designer;

        settings = settings || {};

        var $container = $("#" + this.container),

            containerSize = function () {
                var width = $container.width();
                return {
                    width: $container.width() - 20,
                    height: width / 2
                }
            };

        $container.on('contextmenu', "canvas", function () {
            return false;
        });

        settings.graphwidth = settings.graphwidth || containerSize().width;
        settings.graphheight = settings.graphheight || containerSize().height;
        settings.DefaultActivityWidth = settings.DefaultActivityWidth || 150;
        settings.DefaultActivityHeight = settings.DefaultActivityHeight || 75;

        this.Settings = settings;
        this.Settings.ContainerStage = this.container + "_stage";
        $container.append("<div id='" + this.Settings.ContainerStage + "'></div>");

        this.Stage = new $_.Stage({
            container: this.Settings.ContainerStage,
            width: this.Settings.graphwidth,
            height: this.Settings.graphheight,
            stroke: "black"
        });

        this.Components = [];

        this.AddComponent = function (component) {
            var componentInstance = new component;
            componentInstance.init(this);
            this.Components.push(componentInstance);
            return componentInstance
        };

        this.GetComponentByType = function (type) {
            for (var i = 0; i < this.Components.length; i++)
                if (this.Components[i].type === type) return this.Components[i]
        };

        this.ComponentsExecute = function (method, arg) {
            this.Components.forEach(function (component) {
                component[method] && component[method](arg)
            })
        };

        components && components.forEach(function (component) {
            this.AddComponent(component)
        }, this);

        this.Draw = function (data) {
            this.data = data;
            this.ComponentsExecute("draw");
        };

        this.destroy = function () {
            this.Stage.destroy()
        };
    }

    var Common = {
        createArrowByAngle: function (x, y, angle, radius, color) {
            undefined === color && (color = "red");

            return new $_.Wedge({
                x: x,
                y: y,
                radius: radius,
                angle: 40,
                fill: color,
                rotation: 180 * angle / Math.PI - 200
            });
        },

        updateArrowByAngle: function (arrow, x, y, angle, radius, color) {
            undefined === color && (color = "red");

            arrow.setPosition({
                x: x,
                y: y
            });

            arrow.setRadius(radius);
            arrow.setFill(color);
            arrow.setRotation(180 * angle / Math.PI - 200)
        }
    };

    window.IntroduceGraph = IntroduceGraph

}(jQuery, Konva, window, void 0);
