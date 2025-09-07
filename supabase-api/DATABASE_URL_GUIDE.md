# DATABASE_URL 생성 가이드

## Supabase에서 DATABASE_URL 생성하는 방법

### 1. Supabase 대시보드 접속
1. [Supabase 대시보드](https://supabase.com/dashboard)에 로그인
2. Farm Link 프로젝트 선택

### 2. 데이터베이스 설정 확인
1. 좌측 메뉴에서 **Settings** 클릭
2. **Database** 탭 선택
3. **Connection string** 섹션으로 이동

### 3. DATABASE_URL 복사
**Connection pooling** 탭을 선택하고 URI를 복사합니다.

### 4. DATABASE_URL 형태

#### 일반적인 형태:
```
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

#### 한국 리전 (ap-northeast-2) 예시:
```
postgresql://postgres.abcdefghijklmnop:Korea2025@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres
```

#### 다른 리전 예시:
- 미국 동부: `aws-0-us-east-1.pooler.supabase.com`
- 유럽: `aws-0-eu-west-1.pooler.supabase.com`
- 아시아 태평양 (싱가포르): `aws-0-ap-southeast-1.pooler.supabase.com`

### 5. 환경 변수 설정

`supabase-api/.env` 파일을 생성하고 다음과 같이 설정:

```bash
# Supabase 설정
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# 데이터베이스 연결 URL (한국 리전: ap-northeast-2)
DATABASE_URL=postgresql://postgres.your-project-ref:Korea2025@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres

# 서버 설정
PORT=3000
NODE_ENV=development
```

### 6. 필요한 정보 확인

Supabase 대시보드에서 다음 정보를 확인하세요:

1. **Project URL**: Settings → General → Project URL
2. **Anon Key**: Settings → API → Project API keys → anon public
3. **Service Role Key**: Settings → API → Project API keys → service_role secret
4. **Database Password**: Settings → Database → Database password
5. **Project Reference**: URL에서 추출 (예: `abcdefghijklmnop`)

### 7. 연결 테스트

환경 변수 설정 후 서버를 실행하여 연결을 테스트:

```bash
cd supabase-api
npm install
npm start
```

### 8. 문제 해결

#### 연결 실패 시:
1. 데이터베이스 비밀번호 확인
2. 프로젝트 참조 ID 확인
3. 네트워크 연결 확인
4. Supabase 프로젝트 상태 확인

#### 일반적인 오류:
- `password authentication failed`: 비밀번호 오류
- `connection refused`: 네트워크 또는 URL 오류
- `database does not exist`: 데이터베이스 이름 오류

### 9. 보안 주의사항

- `.env` 파일은 절대 Git에 커밋하지 마세요
- 데이터베이스 비밀번호를 안전하게 보관하세요
- 프로덕션 환경에서는 더 강력한 비밀번호를 사용하세요
