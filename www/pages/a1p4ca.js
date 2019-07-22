import { useState } from 'react'
import { getToken, verifyToken } from '../src/api/admin-token'
import { toast } from 'react-toastify'
import AdminCard from '../src/components/AdminCard'

function A1P4CA ({ isAdmin, posts }) {
  const [token, setToken] = useState('')
  const decodedToken = verifyToken(token)

  if (!isAdmin || !decodedToken) {
    const [value, setValue] = useState('')
    const [error, setError] = useState('')

    const handleAuth = async () => {
      try {
        const token = await getToken(value)
        const decodedToken = verifyToken(token)

        setToken(token)
      } catch (err) {
        setError('로그인 실패! : ' + err)
        toast.error('로그인 실패')
      }
    }

    return (
      <>
        <input
          onChange={e => setValue(e.target.value)}
          type='password'
          placeholder='입력하세요'
        />
        { error && <p style={{ color: 'red' }}>{error}</p> }
        <button onClick={handleAuth}>인증</button>
      </>
    )
  }

  return (
    <div>
      <h1>어서오세요, { decodedToken.name }님</h1>
      { posts.map(v => <AdminCard contents={v} />) }
    </div>
  )
}

A1P4CA.getInitialProps = async () => {
  return {
    posts: [{
      id: 1,
      title: '민달레 꽃',
      content: '그대 맑은 눈을 들어 나를 보느니',
      date: new Date()
    }, {
      id: 2,
      title: '들판에 서서',
      content: `어쩌리, 들판에 서면 떠나지 못하네
  작은 가슴 미어지게 들판이 비어가면
  설움 깊어져서 못내 돌아보고
  떠나지 못하는 무엇이 있을까
  기어이 뿌리치지 못하는
  정든 것이 있었을까

  노여움이었구나
  똑바른 정을 다해 들판을 키웠는데
  거름내고 흙을 갈고 씨 뿌리고 김을 매며
  땀 흘리던 저 일손들, 들판을 채우던 저 알곡들
  어느 것 하나 성하지 못하니
  들꽃들 스스로의 허리꺾고
  흩어져서는 울고 있는지
  눈물 감추며 더욱 아픈 마음들
  부르면 달려오는 것일까

  들판에 가면 이제 알겠네
   〈저 건너 묵은 밭에
  쟁기 벌써 묵었느냐
  임자가 벌써 묵었느냐〉
  빈 들판 울러대는 찬 바람 잠 재우며
  거기 씨 뿌리던 어머니의 손길
  떠나지 못하고 묻어 나오는지
  태어나서 오직 한길 들판에 호미로 사시던 이
  어째서 어머니는 빈 들판이 되셨는지

  짓밟혀 깨어져도 피 뚝뚝 흘려도
  봄이면 새싹 틔워 우리 힘 되어준 땅
  거둔 농사 빼앗겨도 지켜야 할 땅이기에
  평생을 빈 들판으로 어머니는 사셨지만
  제게도 그 순종을 미덕이라 하셨지만
  들판 믿고 당당히 살아야 할
  떳떳이 물려주어야 할 내 땅이기에
  힘차게 두팔 걷고 꽉찬 들판 키워내며
  하늘 빛을 닮은 그 들판 곁에 서서
  지는 해 바라봐야지요 그러믄요
  뜨는 해 바라봐야지요 손뼉쳐야지요`,
      date: new Date()
    }, {
      id: 3,
      title: '편지',
      content: `그대만큼 사랑스러운 사람을 본 일이 없다
  그대만큼 나를 외롭게 한 이도 없었다
  이 생각을 하면 내가 꼭 울게 된다

  그대만큼 나를 정직하게 해준 이가 없었다
  내 안을 비추는 그대는 제일로 영롱한 거울
  그대의 깊이를 다 지나가면
  글썽이는 눈매의 내가 있다
  나의 시작이다

  그대에게 매일 편지를 쓴다
  한 구절 쓰면 한 구절을 와서 읽는 그대
  그래서 이 편지는 한 번도 부치지 않는다`,
      date: new Date()
    }, {
      id: 4,
      title: '테스트',
      content: '안녕하세요안녕하세요안녕하세요안녕하세요안녕하세요안녕하세요안녕하세요안녕하세요안녕하세요안녕하세요안녕하세요안녕하세요안녕하세요안녕하세요안녕하세요안녕하세요안녕하세요안녕하세요안녕하세요안녕하세요안녕하세요안녕하세요안녕하세요안녕하세요안녕하세요안녕하세요안녕하세요안녕하세요안녕하세요안녕하세요안녕하세요안녕하세요안녕하세요안녕하세요안녕하세요안녕하세요안녕하세요안녕하세요안녕하세요안녕하세요안녕하세요안녕하세요안녕하세요안녕하세요안녕하세요안녕하세요안녕하세요',
      date: new Date()
    }],
    isAdmin: true
  }
}

export default A1P4CA