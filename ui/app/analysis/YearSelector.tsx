'use client';

import React, { useMemo, useRef } from 'react';
import { useFormikContext } from 'formik';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Swiper as SwiperClass } from 'swiper';

interface FormValues {
  selectedYears: number[];
}

export const YearSelector: React.FC = () => {
  const { values, setFieldValue } = useFormikContext<FormValues>();

  const currentYear = new Date().getFullYear();
  const MIN_YEAR = 2000;
  const years = useMemo(() => {
    const arr: number[] = [];
    for (let y = MIN_YEAR; y <= currentYear; y++) {
      arr.push(y);
    }
    return arr;
  }, [currentYear]);

  const selected: number[] = values.selectedYears ?? [];

  const toggleYear = (year: number) => {
    if (selected.includes(year)) {
      setFieldValue('selectedYears', selected.filter((y) => y !== year));
    } else {
      setFieldValue('selectedYears', [...selected, year]);
    }
  };

  const selectAll = () => setFieldValue('selectedYears', years.slice());
  const clearAll = () => setFieldValue('selectedYears', []);

  const swiperRef = useRef<SwiperClass | null>(null);

  return (
    <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 shadow-[0_30px_80px_rgba(2,6,23,0.75)]">
      <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.3em] text-slate-400">
        <span className="rounded-full bg-white/5 px-3 py-1 border border-white/10">Years</span>
        <span className="text-slate-500">{MIN_YEAR}–{currentYear}</span>
      </div>
      <h2 className="mt-3 text-xl font-semibold text-white">Which years do you have data for?</h2>
      <p className="text-sm text-slate-400 mt-1 mb-6 max-w-md">
        Select every year with company metrics (range {MIN_YEAR}–{currentYear}).
      </p>

      <div className="relative px-10">
        <button
          onClick={() => swiperRef.current?.slidePrev()}
          className="year-prev absolute left-0 top-1/2 -translate-y-1/2 z-10 rounded-2xl border border-white/10 bg-white/5 p-2 text-white shadow-lg transition hover:border-emerald-400/60 hover:bg-emerald-400/10"
          aria-label="Previous years"
          type="button"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <Swiper
          onSwiper={(sw) => {
            swiperRef.current = sw;
          }}
          initialSlide={years.length - 1}
          loop={false}
          allowTouchMove={false}
          slidesPerView={'auto'}
          spaceBetween={12}
          className="py-2"
        >
          {years.map((year) => {
            const active = selected.includes(year);
            return (
              <SwiperSlide
                key={year}
                style={{ width: '92px' }}
                className="!flex !items-center !justify-center"
              >
                <button
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggleYear(year)}
                  className={`w-full rounded-2xl border px-3 py-2 text-sm font-semibold tracking-wide transition-all duration-200 ${
                    active
                      ? 'bg-emerald-400 text-slate-900 border-emerald-300 shadow-[0_10px_30px_rgba(16,185,129,0.35)]'
                      : 'bg-white/5 text-slate-200 border-white/10 hover:border-emerald-300/40'
                  }`}
                >
                  {year}
                </button>
              </SwiperSlide>
            );
          })}
        </Swiper>

        <button
          onClick={() => swiperRef.current?.slideNext()}
          className="year-next absolute right-0 top-1/2 -translate-y-1/2 z-10 rounded-2xl border border-white/10 bg-white/5 p-2 text-white shadow-lg transition hover:border-emerald-400/60 hover:bg-emerald-400/10"
          aria-label="Next years"
          type="button"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={selectAll}
          className="rounded-2xl bg-emerald-400/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200 border border-emerald-400/40 hover:bg-emerald-400/30"
        >
          Select all
        </button>
        <button
          type="button"
          onClick={clearAll}
          className="rounded-2xl border border-white/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/70 hover:border-rose-400/40 hover:text-rose-200"
        >
          Clear
        </button>
      </div>

      <div className="mt-4 text-[11px] uppercase tracking-[0.35em] text-slate-400">
        Selected years
        <span className="ml-3 rounded-full bg-white/5 px-3 py-1 text-white/80">
          {selected.length > 0 ? selected.slice().sort((a,b)=>b-a).join(', ') : 'none'}
        </span>
      </div>
    </div>
  );
};
