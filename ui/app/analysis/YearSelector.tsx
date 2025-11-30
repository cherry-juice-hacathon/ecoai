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
  // generuj lata od currentYear w dół do MIN_YEAR
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

  // swiper ref to control navigation programmatically
  const swiperRef = useRef<SwiperClass | null>(null);

  return (
    <div className="p-4 rounded-xl border border-slate-700 bg-slate-900/40">
      <h2 className="text-sm font-semibold text-slate-200 mb-2">Za które lata masz dane?</h2>
      <p className="text-xs text-slate-400 mb-4">Wybierz lata, za które firma ma dane dotyczące zużycia (maksymalnie od {MIN_YEAR} do {currentYear}).</p>

      <div className="relative px-8">
        <button
          onClick={() => swiperRef.current?.slidePrev()}
          className="year-prev absolute left-0 top-1/2 -translate-y-1/2 z-10 px-2 py-1 rounded-md text-sm bg-slate-800/60 hover:bg-slate-800/80 transition-opacity"
          aria-label="Poprzednie lata"
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
              spaceBetween={8}
              className="py-1  "
          >
          {years.map((year) => {
            const active = selected.includes(year);
            return (
              <SwiperSlide
                key={year}
                style={{ width: '88px' }}
                className="!flex !items-center !justify-center"
              >
                <button
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggleYear(year)}
                  className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-all border ${
                    active ? 'bg-eco-500 text-slate-900 border-eco-600 shadow-lg' : 'bg-transparent text-slate-300 border-slate-700'
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
          className="year-next absolute right-0 top-1/2 -translate-y-1/2 z-10 px-2 py-1 rounded-md text-sm bg-slate-800/60 hover:bg-slate-800/80 transition-opacity"
          aria-label="Następne lata"
          type="button"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={selectAll}
          className="px-3 py-2 rounded-lg text-xs bg-slate-700 text-slate-100 hover:bg-slate-600"
        >
          Zaznacz wszystkie
        </button>
        <button
          type="button"
          onClick={clearAll}
          className="px-3 py-2 rounded-lg text-xs bg-transparent border border-slate-700 text-slate-300 hover:bg-slate-800"
        >
          Wyczyść
        </button>
      </div>

      <div className="mt-3 text-xs text-slate-400">
        Wybrane lata: {selected.length > 0 ? (selected.slice().sort((a,b)=>b-a).join(', ')) : 'brak'}
      </div>
    </div>
  );
};
