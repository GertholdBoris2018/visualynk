(function() {
    'use strict';

    var app = angular.module('app');

    app.directive('ccImgPerson', ['config', function (config) {
        //Usage:
        //<img data-cc-img-person="{{s.speaker.imageSource}}"/>
        var basePath = config.imageSettings.imageBasePath;
        var unknownImage = config.imageSettings.unknownPersonImageSource;
        var directive = {
            link: link,
            restrict: 'A'
        };
        return directive;

        function link(scope, element, attrs) {
            attrs.$observe('ccImgPerson', function(value) {
                value = basePath + (value || unknownImage);
                attrs.$set('src', value);
            });
        }
    }]);

    app.directive('ccSidebar', function () {
        // Opens and clsoes the sidebar menu.
        // Usage:
        //  <div data-cc-sidebar>
        // Creates:
        //  <div data-cc-sidebar class="sidebar">
        var directive = {
            link: link,
            restrict: 'A'
        };
        return directive;

        function link(scope, element, attrs) {
            var $sidebarInner = element.find('.sidebar-inner');
            var $dropdownElement = element.find('.sidebar-dropdown a');
            element.addClass('sidebar');
            $dropdownElement.click(dropdown);

            function dropdown(e) {
                var dropClass = 'dropy';
                e.preventDefault();
                if (!$dropdownElement.hasClass(dropClass)) {
                    hideAllSidebars();
                    $sidebarInner.slideDown(350);
                    $dropdownElement.addClass(dropClass);
                } else if ($dropdownElement.hasClass(dropClass)) {
                    $dropdownElement.removeClass(dropClass);
                    $sidebarInner.slideUp(350);
                }

                function hideAllSidebars() {
                    $sidebarInner.slideUp(350);
                    $('.sidebar-dropdown a').removeClass(dropClass);
                }
            }
        }
    });

    app.directive('ccWidgetClose', function () {
        // Usage:
        // <a data-cc-widget-close></a>
        // Creates:
        // <a data-cc-widget-close="" href="#" class="wclose">
        //     <i class="fa fa-remove"></i>
        // </a>
        var directive = {
            link: link,
            template: '<i class="fa fa-remove"></i>',
            restrict: 'A'
        };
        return directive;

        function link(scope, element, attrs) {
            attrs.$set('href', '#');
            attrs.$set('wclose');
            element.click(close);

            function close(e) {
                e.preventDefault();
                element.parent().parent().parent().hide(100);
            }
        }
    });

    app.directive('ccWidgetMinimize', function () {
        // Usage:
        // <a data-cc-widget-minimize></a>
        // Creates:
        // <a data-cc-widget-minimize="" href="#"><i class="fa fa-chevron-up"></i></a>
        var directive = {
            link: link,
            template: '<i class="fa fa-chevron-up"></i>',
            restrict: 'A'
        };
        return directive;

        function link(scope, element, attrs) {
            //$('body').on('click', '.widget .wminimize', minimize);
            attrs.$set('href', '#');
            attrs.$set('wminimize');
            element.click(minimize);

            function minimize(e) {
                e.preventDefault();
                var $wcontent = element.parent().parent().next('.widget-content');
                var iElement = element.children('i');
                if ($wcontent.is(':visible')) {
                    iElement.removeClass('fa fa-chevron-up');
                    iElement.addClass('fa fa-chevron-down');
                } else {
                    iElement.removeClass('fa fa-chevron-down');
                    iElement.addClass('fa fa-chevron-up');
                }
                $wcontent.toggle(500);
            }
        }
    });

    app.directive('ccScrollToTop', ['$window',
        // Usage:
        // <span data-cc-scroll-to-top></span>
        // Creates:
        // <span data-cc-scroll-to-top="" class="totop">
        //      <a href="#"><i class="fa fa-chevron-up"></i></a>
        // </span>
        function ($window) {
            var directive = {
                link: link,
                template: '<a href="#"><i class="fa fa-chevron-up"></i></a>',
                restrict: 'A'
            };
            return directive;

            function link(scope, element, attrs) {
                var $win = $($window);
                element.addClass('totop');
                $win.scroll(toggleIcon);

                element.find('a').click(function (e) {
                    e.preventDefault();
                    // Learning Point: $anchorScroll works, but no animation
                    //$anchorScroll();
                    $('body').animate({ scrollTop: 0 }, 500);
                });

                function toggleIcon() {
                    $win.scrollTop() > 300 ? element.slideDown(): element.slideUp();
                }
            }
        }
    ]);

    app.directive('ccSpinner', ['$window', function ($window) {
        // Description:
        //  Creates a new Spinner and sets its options
        // Usage:
        //  <div data-cc-spinner="vm.spinnerOptions"></div>
        var directive = {
            link: link,
            restrict: 'A'
        };
        return directive;

        function link(scope, element, attrs) {
            scope.spinner = null;
            scope.$watch(attrs.ccSpinner, function (options) {
                if (scope.spinner) {
                    scope.spinner.stop();
                }
                scope.spinner = new $window.Spinner(options);
                scope.spinner.spin(element[0]);
            }, true);
        }
    }]);

    app.directive('ccWidgetHeader', function() {
        //Usage:
        //<div data-cc-widget-header title="vm.map.title"></div>
        var directive = {
            link: link,
            scope: {
                'title': '@',
                'subtitle': '@',
                'rightText': '@',
                'allowCollapse': '@'
            },
            templateUrl: '/app/layout/widgetheader.html',
            restrict: 'A',
        };
        return directive;

        function link(scope, element, attrs) {
            attrs.$set('class', 'widget-head');
        }
    });


    app.directive('checklistModel', ['$parse', '$compile', function($parse, $compile) {
      // contains
      function contains(arr, item) {
        if (angular.isArray(arr)) {
          for (var i = 0; i < arr.length; i++) {
            if (angular.equals(arr[i], item)) {
              return true;
            }
          }
        }
        return false;
      }
    
      // add
      function add(arr, item) {
        arr = angular.isArray(arr) ? arr : [];
        for (var i = 0; i < arr.length; i++) {
          if (angular.equals(arr[i], item)) {
            return arr;
          }
        }
        arr.push(item);
        return arr;
      }
    
      // remove
      function remove(arr, item) {
        if (angular.isArray(arr)) {
          for (var i = 0; i < arr.length; i++) {
            if (angular.equals(arr[i], item)) {
              arr.splice(i, 1);
              break;
            }
          }
        }
        return arr;
      }
    
      // http://stackoverflow.com/a/19228302/1458162
      function postLinkFn(scope, elem, attrs) {
        // compile with `ng-model` pointing to `checked`
        $compile(elem)(scope);
    
        // getter / setter for original model
        var getter = $parse(attrs.checklistModel);
        var setter = getter.assign;
    
        // value added to list
        var value = $parse(attrs.checklistValue)(scope.$parent);
    
        // watch UI checked change
        scope.$watch('checked', function(newValue, oldValue) {
          if (newValue === oldValue) {
            return;
          }
          var current = getter(scope.$parent);
          if (newValue === true) {
            setter(scope.$parent, add(current, value));
          } else {
            setter(scope.$parent, remove(current, value));
          }
        });
    
        // watch original model change
        scope.$parent.$watch(attrs.checklistModel, function(newArr, oldArr) {
          scope.checked = contains(newArr, value);
        }, true);
      }
    
      return {
        restrict: 'A',
        priority: 1000,
        terminal: true,
        scope: true,
        compile: function(tElement, tAttrs) {
          if (tElement[0].tagName !== 'INPUT' || !tElement.attr('type', 'checkbox')) {
            throw 'checklist-model should be applied to `input[type="checkbox"]`.';
          }
    
          if (!tAttrs.checklistValue) {
            throw 'You should provide `checklist-value`.';
          }
    
          // exclude recursion
          tElement.removeAttr('checklist-model');
          
          // local scope var storing individual checkbox model
          tElement.attr('ng-model', 'checked');
    
          return postLinkFn;
        }
      };
    }]);

    app.directive('elheightresize', ['$window', function($window) {
        return {
            link: function(scope, elem, attrs) {
                scope.onResize = function() {
                    var top_header_height = angular.element(".navbar-inner").height();
                    var page_title_height = angular.element(".page-title").height();
                    var margin_gaps = 60;

                    elem.css('height', $window.innerHeight-top_header_height-margin_gaps-page_title_height);
                }
                scope.onResize();

                angular.element($window).bind('resize', function() {
                    scope.onResize();
                })
            }
        }
    }]);

    app.directive('slimscroll', ['$timeout', '$window', function ($timeout, $window) {
        'use strict';

        return {
            restrict: 'A',
            link: function ($scope, $elem, $attr) {
                var off = [];
                var option = {};

                var refresh = function () {
                    $timeout(function () {
                        if (angular.isDefined($attr.slimscroll)) {
                            option = $scope.$eval($attr.slimscroll) || {};
                        } else if ($attr.slimscrollOption) {
                            option = $scope.$eval($attr.slimscrollOption) || {};
                        }

                        var top_header_height = angular.element(".navbar-inner").height();
                        var page_title_height = angular.element(".page-title").height();
                        var margin_gaps = 60;

                        option.height = $window.innerHeight-top_header_height-margin_gaps-page_title_height;
                        option.color = "#a1b2bd";
                        option.disableFadeOut = true;
                        option.size = 4;

                        var el = angular.element($elem);
                        el.slimScroll(option);

                        var slimdivheight = angular.element(".span12 .slimScrollDiv").height();
                        angular.element(".span12 .slimScrollDiv").css("height", slimdivheight+25);

                    });
                };

                angular.element($window).bind('resize', function() {
                    if ($attr.slimscroll) {
                        option = $scope.$eval($attr.slimscroll);
                    } else if ($attr.slimscrollOption) {
                        option = $scope.$eval($attr.slimscrollOption);
                    }

                    $($elem).slimScroll({ destroy: true });

                    var top_header_height = angular.element(".navbar-inner").height();
                    var page_title_height = angular.element(".page-title").height();
                    var margin_gaps = 60;

                    option.height = $window.innerHeight-top_header_height-margin_gaps-page_title_height;
                    option.color = "#a1b2bd";
                    option.disableFadeOut = true;
                    option.size = 4;
                    $($elem).slimScroll(option);

                    var slimdivheight = angular.element(".span12 .slimScrollDiv").height();
                    angular.element(".span12 .slimScrollDiv").css("height", slimdivheight+25);
                });

                var registerWatch = function () {
                    if (angular.isDefined($attr.slimscroll) && !option.noWatch) {
                        off.push($scope.$watchCollection($attr.slimscroll, refresh));
                    }

                    if ($attr.slimscrollWatch) {
                        off.push($scope.$watchCollection($attr.slimscrollWatch, refresh));
                    }

                    if ($attr.slimscrolllistento) {
                        off.push($scope.$on($attr.slimscrolllistento, refresh));
                    }
                };

                var destructor = function () {
                    angular.element($elem).slimScroll({destroy: true});
                    off.forEach(function (unbind) {
                        unbind();
                    });
                    off = null;
                };

                off.push($scope.$on('$destroy', destructor));

                registerWatch();
            }
        };
    }]);

    app.directive('slimscrollmdl', ['$timeout', '$window', function ($timeout, $window) {
        'use strict';

        return {
            restrict: 'A',
            link: function ($scope, $elem, $attr) {
                var off = [];
                var option = {};

                var refresh = function () {
                    $timeout(function () {
                        if (angular.isDefined($attr.slimscrollmdl)) {
                            option = $scope.$eval($attr.slimscrollmdl) || {};
                        } else if ($attr.slimscrollOption) {
                            option = $scope.$eval($attr.slimscrollOption) || {};
                        }

                        option.height = 500;
                        option.color = "#a1b2bd";
                        option.disableFadeOut = true;
                        option.size = 4;

                        var el = angular.element($elem);
                        el.slimScroll(option);
                    });
                };

                angular.element($window).bind('resize', function() {
                    if ($attr.slimscrollmdl) {
                        option = $scope.$eval($attr.slimscrollmdl);
                    } else if ($attr.slimscrollOption) {
                        option = $scope.$eval($attr.slimscrollOption);
                    }

                    $($elem).slimScroll({ destroy: true });

                    option.height = 500;
                    option.color = "#a1b2bd";
                    option.disableFadeOut = true;
                    option.size = 4;
                    $($elem).slimScroll(option);
                });

                var registerWatch = function () {
                    if (angular.isDefined($attr.slimscrollmdl) && !option.noWatch) {
                        off.push($scope.$watchCollection($attr.slimscrollmdl, refresh));
                    }

                    if ($attr.slimscrollWatch) {
                        off.push($scope.$watchCollection($attr.slimscrollWatch, refresh));
                    }

                    if ($attr.slimscrolllistento) {
                        off.push($scope.$on($attr.slimscrolllistento, refresh));
                    }
                };

                var destructor = function () {
                    angular.element($elem).slimScroll({destroy: true});
                    off.forEach(function (unbind) {
                        unbind();
                    });
                    off = null;
                };

                off.push($scope.$on('$destroy', destructor));

                registerWatch();
            }
        };
    }]);

    app.directive('slideable', function () {
            return {
                restrict:'C',
                compile: function (element, attr) {
                    // wrap tag
                    var contents = element.html();
                    element.html('<div class="slideable_content" style="margin:0 !important; padding:0 !important" >' + contents + '</div>');

                    return function postLink(scope, element, attrs) {
                        // default properties
                        attrs.duration = (!attrs.duration) ? '1s' : attrs.duration;
                        attrs.easing = (!attrs.easing) ? 'ease-in-out' : attrs.easing;
                        element.css({
                            'overflow': 'hidden',
                            'height': '0px',
                            'transitionProperty': 'height',
                            'transitionDuration': attrs.duration,
                            'transitionTimingFunction': attrs.easing
                        });
                    };
                }
            };
        })
        .directive('slideToggle', function() {
            return {
                restrict: 'A',
                link: function(scope, element, attrs) {
                    var target, content;

                    attrs.expanded = false;

                    element.bind('click', function() {
                        if (!target) target = document.querySelector(attrs.slideToggle);
                        if (!content) content = target.querySelector('.slideable_content');

                        if(!attrs.expanded) {
                            content.style.border = '1px solid rgba(0,0,0,0)';
                            var y = content.clientHeight;
                            content.style.border = 0;
                            target.style.height = y + 'px';
                        } else {
                            target.style.height = '0px';
                        }
                        attrs.expanded = !attrs.expanded;
                    });
                }
            }
        });

})();