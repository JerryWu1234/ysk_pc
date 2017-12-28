!function ($) {
    $(function () {

        Renderer.delimiters = ["[[", "]]"];
        riot.mount('*');
        //上：横幅
        var model = [
            {
                img: "./imgs/carousel/LucRo不知道.png",
                kls: "active"
            },
            {
                img: "./imgs/carousel/LucRo动力学.png"
            },
            {
                img: "./imgs/carousel/LucRo经典.png"
            },
            {
                img: "./imgs/carousel/LucRo运动.png"
            },
            {
                img: "./imgs/carousel/压力板.jpg"
            },
            {
                img: "./imgs/carousel/工厂1.jpg"
            },
            {
                img: "./imgs/carousel/工厂2.jpg"
            },
            {
                img: "./imgs/carousel/工厂3.jpg"
            },
            {
                img: "./imgs/carousel/康复仪.jpg"
            },
            {
                img: "./imgs/carousel/足底扫描仪.jpg"
            }
        ];

        var template =
            '<div class="item [[kls]]">' +
            '   <img src="[[img]]" >' +
            '</div>';

        $(".carousel-inner").html(new Renderer(template).compile(model));

        //下：图片列表
        var contentModel = [
            {
                img: "./imgs/content/1.jpg",
                nav: {
                    title: "LucRo",
                    subTitle: "糖尿病足<br/>预防",
                    bgColor: "#ED720B",
                    moreHref :"lucro.html"
                }
            },
            {
                img: "./imgs/content/2.png",
                nav: {
                    title: "YSK",
                    subTitle: "中老年<br/>保护",
                    bgColor: "#00A0EA",
                }
            },
            {
                img: "./imgs/content/3.png",
                nav: {
                    title: "MyShoe",
                    subTitle: "3D技术<br/>定制",
                    bgColor: "#EA0001",
                    moreHref: 'detail_2.html',
                }
            },
            {
                img: "./imgs/content/4.png",
                nav: {
                    title: "Schein Works",
                    subTitle: "压力检测",
                    bgColor: "#73D7A1",
                    moreHref: "./zuyaliban.html"
                }
            }
        ];

        var contentTemplate =
            '<div class="content">' +
            ' <a href="[[nav.moreHref]]"><img src="[[img]]" style="width: 100%;"></a>' +
            ' <div class="nav" style="background-color: [[nav.bgColor]]">' +
            '   <div class="title" style="">[[nav.title]]</div>' +
            '   <div class="subTitle" style="">[[nav.subTitle]]</div>' +
            '   <div style="position: absolute;bottom: 10px;text-align: center">' +
            '    <a href="[[nav.shopHref]]"><img src="./imgs/shop.png" class="shopImg" style=""></a>' +
            '    <a href="[[nav.moreHref]]"><img src="./imgs/user.png" class="moreImg" alt=""></a>' +
            '  </div>' +
            ' </div>' +
            '</div>';

        $(".content-warp").html(new Renderer(contentTemplate).compile(contentModel));

        var $carousel = $("#carousel"),
            $item = $(".item");

        function carousel() {
            return $carousel.carousel.apply($carousel, arguments)
        }

        $carousel.carousel({
            interval: 4000
        });

        $item.on("touchstart", function () {
            carousel("pause")
        }).on("touchend", function () {
            carousel("cycle");
        });

        var touch = {
            start: {},//保存touchstart时的数据；
            end: {},//保存touchend时的数据；
            types: {},//保存touch.on传进来的参数，即，事件类型和此类型下要执行的函数；
            isaddevent: false,//表示是否注册了三个事件；
            on: function (type, func) {
                this.types[type + ""] = func;
                var start = function (e) {
                    e.stopPropagation();//阻止冒泡
                    //console.log("start");
                    var tar = e.targetTouches[0];
                    touch.start = {x: tar.pageX, y: tar.pageY, time: +new Date()};
                }
                var move = function (e) {
                    e.stopPropagation();
                    //console.log("move");
                    event.preventDefault();//阻止默认事件。就是浏览器默认，移动事件触发时，让页面滚动；
                    var tar = e.targetTouches[0];
                    touch.end = {
                        x: tar.pageX - touch.start.x,
                        y: tar.pageY - touch.start.y
                    };
                }
                var end = function (e) {
                    e.stopPropagation();
                    //console.log("end");
                    var end = touch.end;
                    var start = touch.start;
                    if (end.x != undefined) {
                        var isScrolling = Math.abs(end.x) < Math.abs(end.y) ? 1 : 0;
                        var duration = +new Date() - start.time;
                        if (Number(duration) > 10) {
                            if (isScrolling == 0) {
                                //判断是左滑还是右滑
                                if (end.x > 10) {
                                    touch.types["swiperight"]();
                                } else if (end.x < -10) {
                                    touch.types["swipeleft"]();
                                }
                            } else if (isScrolling == 1) {
                                //判断是上滑还是下滑
                                if (end.y > 10) {
                                    touch.types["swipedown"]();
                                } else if (end.y < -10) {
                                    touch.types["swipeup"]();
                                }
                            }
                        }
                    }
                    touch.end = {};
                };
                if (!touch.isaddevent) {//如果注册过这三个事件了，就不再重复注册；
                    $carousel.on("touchstart", start);
                    $carousel.on("touchmove", move);
                    $carousel.on("touchend", end);
                    touch.isaddevent = true;
                }
            }
        };
        touch.on("swiperight", function () {
            carousel('prev')
        });
        touch.on("swipeleft", function () {
            carousel('next')
        });
    });

}(jQuery)

