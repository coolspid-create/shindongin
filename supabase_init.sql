-- 1. 포트폴리오 프로젝트 테이블 생성 (이미 존재하면 무시)
CREATE TABLE IF NOT EXISTS public.portfolio_projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    image_url TEXT,
    link_url TEXT,
    project_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 사이트 컨텐츠(텍스트) 테이블 생성 (이미 존재하면 무시)
CREATE TABLE IF NOT EXISTS public.site_content (
    section_key TEXT PRIMARY KEY,
    content TEXT NOT NULL
);

-- 3. 사이트 컨텐츠 초기 데이터 삽입
INSERT INTO public.site_content (section_key, content) VALUES
('hero_title', 'LEADING AX<br>TRANSFORMATION'),
('hero_desc', 'Empowering organizations to navigate the shift to AI-first experiences. We provide the strategic vision and technical execution required to unlock new creative frontiers.'),
('hero_label', 'AI ERA AX TRANSFORMATION MANAGER'),
('about_bio', 'AI 시대의 비즈니스 전환을 설계하는 AX 트랜스포메이션 매니저. 전략적 기획과 기술 표준화를 통해 조직이 AI-first로 진화할 수 있도록 이끕니다.'),
('about_h2', 'Bridging Human Potential<br>& AI Logic.'),
('footer_location', 'GLOBAL / RESIDENT IN SEOUL'),
('pillar1_title', '기획'),
('pillar1_desc', 'AI 통합을 위한 비즈니스 전략 수립과 실행 로드맵 설계. 복잡한 디지털 전환 과정을 체계적으로 구조화합니다.'),
('pillar2_title', 'AX'),
('pillar2_desc', 'AI-first Experience 설계. 사용자 중심의 자연스러운 AI 상호작용을 구축하여 새로운 경험의 지평을 엽니다.'),
('pillar3_title', '표준'),
('pillar3_desc', 'AI 업무 프로세스의 표준화와 품질 관리. 지속 가능한 운영 체계를 확립하여 조직의 효율을 극대화합니다.')
ON CONFLICT (section_key) DO UPDATE SET content = EXCLUDED.content;

-- 4. Row Level Security (RLS) 설정
ALTER TABLE public.portfolio_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

-- 기존 정책 삭제 (중복 생성 에러 방지)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.portfolio_projects;
DROP POLICY IF EXISTS "Anyone can insert/update/delete projects." ON public.portfolio_projects;
DROP POLICY IF EXISTS "Users can insert/update/delete their own projects." ON public.portfolio_projects;

DROP POLICY IF EXISTS "Public content is viewable by everyone." ON public.site_content;
DROP POLICY IF EXISTS "Anyone can insert/update/delete content." ON public.site_content;
DROP POLICY IF EXISTS "Users can insert/update/delete content." ON public.site_content;

-- 새 정책 적용 (Anon 권한 부여)
CREATE POLICY "Public profiles are viewable by everyone."
ON public.portfolio_projects FOR SELECT USING ( true );

CREATE POLICY "Anyone can insert/update/delete projects."
ON public.portfolio_projects FOR ALL USING ( true );

CREATE POLICY "Public content is viewable by everyone."
ON public.site_content FOR SELECT USING ( true );

CREATE POLICY "Anyone can insert/update/delete content."
ON public.site_content FOR ALL USING ( true );


-- 5. Storage Bucket 생성
INSERT INTO storage.buckets (id, name, public)
VALUES ('portfolio-assets', 'portfolio-assets', true)
ON CONFLICT (id) DO NOTHING;


-- 6. Storage 권한 (이미 존재하는 정책 삭제 후 생성)
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Anon Insert" ON storage.objects;
DROP POLICY IF EXISTS "Anon Update" ON storage.objects;
DROP POLICY IF EXISTS "Anon Delete" ON storage.objects;
DROP POLICY IF EXISTS "Auth Insert" ON storage.objects;
DROP POLICY IF EXISTS "Auth Update" ON storage.objects;
DROP POLICY IF EXISTS "Auth Delete" ON storage.objects;

CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'portfolio-assets' );

CREATE POLICY "Anon Insert"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'portfolio-assets' );

CREATE POLICY "Anon Update"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'portfolio-assets' );

CREATE POLICY "Anon Delete"
ON storage.objects FOR DELETE
USING ( bucket_id = 'portfolio-assets' );
