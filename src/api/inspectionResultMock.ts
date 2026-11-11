import entrancePhoto from '@/assets/inspection-results/entrance.png';
import drainPhoto from '@/assets/inspection-results/drain.png';

export const resultMock = {
  publishedAt: '2026-09-07T10:00:00+09:00',
  summary: '출입구가 낮고 배수구 주변에 이물질이 쌓여 있어 빗물 유입에 대비한 조치가 필요해요.',
  photos: [
    { photoId: 1, url: entrancePhoto },
    { photoId: 2, url: entrancePhoto },
    { photoId: 3, url: drainPhoto },
  ],
  vulnerabilities: [
    {
      type: 'ENTRANCE',
      title: '낮은 출입구 높이',
      expertOpinion:
        '출입구 하단이 주변 외부 바닥과 비교해 낮게 형성되어 있어 짧은 시간에 많은 비가 내릴 경우 빗물이 출입구 방향으로 유입될 가능성이 있는 상태로 확인됐어요',
      fieldFindings:
        '기존 차수시설은 설치되어 있지 않았으며, 출입구 전면 공간에 별도의 유입 차단 구조가 없는 상태예요.',
    },
    {
      type: 'DRAIN',
      title: '배수구 이물질 적체',
      expertOpinion:
        '배수구 주변에 토사와 낙엽이 쌓여 있어 많은 비가 내릴 때 빗물이 빠지는 속도가 느려질 수 있는 상태로 확인됐어요.',
      fieldFindings: '배수구 덮개 주변에 이물질이 쌓여 있고, 역류방지 장치는 설치되어 있지 않아요.',
    },
  ],
  recommendations: [
    '출입구: 빗물 유입을 줄이는 물막이판 설치를 검토해요.',
    '배수구: 주변을 정리하고 막힘 여부와 배수 상태를 확인해요.',
    '사전점검 및 대피 준비: 호(시)우(지) 전 주변 위험과 대피 경로를 확인하고 필요한 준비물을 챙겨요.',
    '관련 취약지점\n창문·개구부의 창문 차수판 설치를 검토해요.',
  ],
} as const;
