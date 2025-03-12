import { Component, OnInit, AfterViewInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import Swiper from 'swiper';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/autoplay';
import { NewsService, NewsItem } from '../services/news.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit, AfterViewInit {
  newsList: NewsItem[] = [];
  private swiper: Swiper | undefined;

  constructor(
    private http: HttpClient,
    private newsService: NewsService
  ) {}

  ngOnInit(): void {
    this.fetchNews();
  }

  ngAfterViewInit(): void {
    this.initSwiper();
    this.initCountUp();
  }

  private initSwiper(): void {
    this.swiper = new Swiper('.swiper-container', {
      modules: [Navigation, Pagination, Autoplay],
      slidesPerView: 1,
      spaceBetween: 20,
      loop: true,
      autoplay: {
        delay: 5000,
        disableOnInteraction: false,
      },
      pagination: {
        el: '.swiper-pagination',
        clickable: true,
      },
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
      breakpoints: {
        640: {
          slidesPerView: 1,
          spaceBetween: 20,
        },
        768: {
          slidesPerView: 2,
          spaceBetween: 30,
        },
        1024: {
          slidesPerView: 3,
          spaceBetween: 30,
        },
      },
    });
  }

  private initCountUp(): void {
    const countUpElements = document.querySelectorAll('.count-up-value');
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.5
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const element = entry.target;
          const target = parseInt(element.getAttribute('data-count') || '0');
          const suffix = element.getAttribute('data-suffix') || '';
          
          this.animateValue(element, 0, target, 2000, suffix);
          observer.unobserve(element);
        }
      });
    }, options);

    countUpElements.forEach(element => {
      observer.observe(element);
    });
  }

  private animateValue(
    element: Element,
    start: number,
    end: number,
    duration: number,
    suffix: string
  ): void {
    const range = end - start;
    const startTime = performance.now();

    const updateCount = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function for smooth animation
      const easeOutQuad = (t: number): number => {
        return t * (2 - t);
      };

      const currentValue = Math.floor(start + (range * easeOutQuad(progress)));
      element.textContent = `${currentValue}${suffix}`;

      if (progress < 1) {
        requestAnimationFrame(updateCount);
      } else {
        element.textContent = `${end}${suffix}`;
      }
    };

    requestAnimationFrame(updateCount);
  }

  private fetchNews(): void {
    this.newsService.getNews().subscribe({
      next: (data) => {
        this.newsList = data;
        if (this.newsList.length === 0) {
          this.newsList = this.getDefaultNews();
        }
        setTimeout(() => {
          if (this.swiper) {
            this.swiper.destroy();
          }
          this.initSwiper();
        }, 0);
      },
      error: (error) => {
        console.error('Error fetching news:', error);
        this.newsList = this.getDefaultNews();
        setTimeout(() => this.initSwiper(), 0);
      }
    });
  }

  private getDefaultNews(): NewsItem[] {
    return [
      { 
        title: 'New Web Development Batch Starting Soon', 
        date: 'May 15, 2025', 
        description: 'Join our comprehensive web development program and learn the latest technologies in the industry.' 
      },
      { 
        title: 'Student Success Story: Placed at Top Tech Company', 
        date: 'May 10, 2025', 
        description: 'Our student secured a position at a leading tech company with a package of 12 LPA after completing our course.' 
      },
      { 
        title: 'Free Workshop on Data Analytics', 
        date: 'May 5, 2025', 
        description: 'Attend our free workshop on data analytics basics and career opportunities in this growing field.' 
      },
      { 
        title: 'New Course: Cloud Computing Fundamentals', 
        date: 'April 28, 2025', 
        description: 'We are launching a new course on cloud computing covering AWS, Azure, and Google Cloud platforms.' 
      },
      { 
        title: 'Industry Expert Talk Series', 
        date: 'April 20, 2025', 
        description: 'Join our upcoming webinar featuring industry experts discussing current trends in technology.' 
      }
    ];
  }
}