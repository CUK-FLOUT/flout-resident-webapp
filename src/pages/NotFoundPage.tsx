import { useNavigate } from 'react-router';
import { Screen } from '@/components/layout';
import { Button } from '@/components/ui';
import { PATHS } from '@/constants/paths';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <Screen
      header={{ onBack: false }}
      bottom={<Button onClick={() => navigate(PATHS.home)}>홈으로 가기</Button>}
    >
      <div className="flex flex-1 flex-col justify-center gap-2 text-center">
        <p className="text-heading text-ink">페이지를 찾을 수 없어요</p>
        <p className="text-body text-body-text">주소가 바뀌었거나 삭제된 페이지예요.</p>
      </div>
    </Screen>
  );
}
