(function ($) {
    "use strict";

    // Navbar on scrolling
    $(window).scroll(function () {
        if ($(this).scrollTop() > 200) {
            $('.navbar').fadeIn('slow').css('display', 'flex');
        } else {
            $('.navbar').fadeOut('slow').css('display', 'none');
        }
    });


    // Smooth scrolling on the navbar links
    $(".navbar-nav a").on('click', function (event) {
        if (this.hash !== "") {
            event.preventDefault();
            
            $('html, body').animate({
                scrollTop: $(this.hash).offset().top - 45
            }, 1500, 'easeInOutExpo');
            
            if ($(this).parents('.navbar-nav').length) {
                $('.navbar-nav .active').removeClass('active');
                $(this).closest('a').addClass('active');
            }
        }
    });


    // Typed Initiate
    if ($('.typed-text-output').length == 1) {
        var typed_strings = $('.typed-text').text();
        var typed = new Typed('.typed-text-output', {
            strings: typed_strings.split(', '),
            typeSpeed: 100,
            backSpeed: 20,
            smartBackspace: false,
            loop: true
        });
    }


    // Modal Video
    $(document).ready(function () {
        var $videoSrc;
        $('.btn-play').click(function () {
            $videoSrc = $(this).data("src");
        });
        console.log($videoSrc);

        $('#videoModal').on('shown.bs.modal', function (e) {
            $("#video").attr('src', $videoSrc + "?autoplay=1&amp;modestbranding=1&amp;showinfo=0");
        })

        $('#videoModal').on('hide.bs.modal', function (e) {
            $("#video").attr('src', $videoSrc);
        })
    });


    // Scroll to Bottom
    $(window).scroll(function () {
        if ($(this).scrollTop() > 100) {
            $('.scroll-to-bottom').fadeOut('slow');
        } else {
            $('.scroll-to-bottom').fadeIn('slow');
        }
    });


    // Skills
    $('.skill').waypoint(function () {
        $('.progress .progress-bar').each(function () {
            $(this).css("width", $(this).attr("aria-valuenow") + '%');
        });
    }, {offset: '80%'});


    // Portfolio isotope and filter
    var portfolioIsotope;
    $(window).on('load', function () {
        portfolioIsotope = $('.portfolio-container').isotope({
            itemSelector: '.portfolio-item',
            layoutMode: 'fitRows'
        });
    });
    $('#portfolio-flters li').on('click', function () {
        $("#portfolio-flters li").removeClass('active');
        $(this).addClass('active');

        portfolioIsotope.isotope({filter: $(this).data('filter')});
    });
    
    
    // Back to top button
    $(window).scroll(function () {
        if ($(this).scrollTop() > 200) {
            $('.back-to-top').fadeIn('slow');
        } else {
            $('.back-to-top').fadeOut('slow');
        }
    });
    $('.back-to-top').click(function () {
        $('html, body').animate({scrollTop: 0}, 1500, 'easeInOutExpo');
        return false;
    });


    // Testimonials carousel
    $(".testimonial-carousel").owlCarousel({
        autoplay: true,
        smartSpeed: 1500,
        dots: true,
        loop: true,
        items: 1
    });


    // Scroll progress bar
    $(window).scroll(function () {
        var scrollTop = $(this).scrollTop();
        var docHeight = $(document).height() - $(window).height();
        var progress = (scrollTop / docHeight) * 100;
        $('#scroll-progress').css('width', progress + '%');
    });


    // Impact stat counters
    var impactCounted = false;
    $('.impact-section').waypoint(function () {
        if (!impactCounted) {
            impactCounted = true;
            $('.impact-number').each(function () {
                var $el = $(this);
                var target = parseInt($el.data('target'), 10);
                var duration = 1500;
                var stepTime = Math.max(Math.floor(duration / target), 20);
                var current = 0;
                var timer = setInterval(function () {
                    current += 1;
                    $el.text(current);
                    if (current >= target) {
                        $el.text(target);
                        clearInterval(timer);
                    }
                }, stepTime);
            });
        }
    }, { offset: '80%' });

    // Skill Radar Chart
    $(window).on('load', function () {
        var ctx = document.getElementById('skillRadar');
        if (ctx) {
            new Chart(ctx, {
                type: 'radar',
                data: {
                    labels: ['Python', 'AI / LLM', 'Data Science', 'DevOps', 'Visualization', 'DBT / SQL'],
                    datasets: [{
                        label: 'Proficiency',
                        data: [95, 95, 90, 80, 90, 85],
                        backgroundColor: 'rgba(11, 206, 175, 0.15)',
                        borderColor: '#0BCEAF',
                        borderWidth: 2,
                        pointBackgroundColor: '#0BCEAF',
                        pointBorderColor: '#fff',
                        pointHoverBackgroundColor: '#FFD166',
                        pointHoverBorderColor: '#FFD166',
                        pointRadius: 5
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        r: {
                            min: 0,
                            max: 100,
                            ticks: {
                                stepSize: 25,
                                color: '#aaa',
                                font: { family: 'JetBrains Mono', size: 10 },
                                backdropColor: 'transparent'
                            },
                            grid: { color: 'rgba(11, 206, 175, 0.15)' },
                            angleLines: { color: 'rgba(11, 206, 175, 0.15)' },
                            pointLabels: {
                                color: '#343a40',
                                font: { family: 'JetBrains Mono', size: 11, weight: '700' }
                            }
                        }
                    },
                    plugins: {
                        legend: { display: false }
                    },
                    animation: {
                        duration: 1500,
                        easing: 'easeInOutQuart'
                    }
                }
            });
        }
    });

    // Custom cursor glow
    $(document).on('mousemove', function (e) {
        $('.cursor-glow').css({ left: e.clientX, top: e.clientY });
    });
    $('a, button, .btn').on('mouseenter', function () {
        $('.cursor-glow').addClass('cursor-glow--active');
    }).on('mouseleave', function () {
        $('.cursor-glow').removeClass('cursor-glow--active');
    });

})(jQuery);

