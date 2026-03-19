# 📦 Vue2.7 + Vuex + Composition API

## 해외 패키지 상세 페이지 구조 정리

---

# 1. 전체 구조 개요

```text
SSR (basicInfo)
  ↓
store.basicInfo 저장
  ↓
UI 초기 렌더링 (SSR 데이터 사용)

onMounted
  ↓
detailInfo API 호출 (CSR)
  ↓
store.detailInfo 업데이트
  ↓
UI 자동 갱신 (computed fallback)

[사용자 액션]
- 달력 선택 → API 재호출 + 전체 상태 갱신 (person 유지)
- 인원 변경 → store 업데이트 + 총금액 자동 계산
```

---

# 2. 핵심 설계 원칙

## 2.1 역할 분리

| 영역                     | 역할                       |
| ---------------------- | ------------------------ |
| basicInfo              | SSR 데이터                  |
| detailInfo             | CSR 상세 데이터               |
| selectedDateAndPersons | 사용자 선택 상태                |
| useBasicInfo           | SSR/CSR fallback + UI 가공 |
| useDetailInfo          | API 호출 + 상태 동기화          |
| getter                 | 가격 계산                    |

---

## 2.2 데이터 흐름

```text
SSR → basicInfo
CSR → detailInfo
↓
useBasicInfo (fallback)
↓
UI
```

---

## 2.3 절대 규칙

* ❌ 계산 로직은 hook에 넣지 않는다
* ❌ computed에서 상태 변경 금지
* ❌ API 로직을 여러 곳에 분산 금지

---

# 3. Store 구조

## 3.1 selectedDateAndPersons

```js
export default {
  namespaced: true,

  state: () => ({
    departureDate: null,
    arrivalDate: null,

    price: {
      adult: 0,
      child: 0,
      infant: 0,
    },

    person: {
      adult: 1,
      child: 0,
      infant: 0,
    },

    promotion: {
      discountAmount: 0,
    },
  }),

  mutations: {
    SET_INIT(state, payload) {
      state.departureDate = payload.departureDate
      state.arrivalDate = payload.arrivalDate
      state.price = payload.price
      state.person = payload.person
    },

    SET_PRICE(state, price) {
      state.price = price
    },

    SET_PERSON(state, payload) {
      state.person = {
        ...state.person,
        ...payload,
      }
    },
  },

  getters: {
    totalPerson(state) {
      return (
        state.person.adult +
        state.person.child +
        state.person.infant
      )
    },

    totalPrice(state) {
      const adult = state.price.adult * state.person.adult
      const child = state.price.child * state.person.child
      const infant = state.price.infant * state.person.infant

      return (
        adult + child + infant - state.promotion.discountAmount
      )
    },
  },
}
```

---

## 3.2 detailInfo

```js
export default {
  namespaced: true,

  state: () => ({
    detail: null,
    loading: false,
  }),

  mutations: {
    SET_DETAIL(state, data) {
      state.detail = data
    },
  },

  actions: {
    async fetchDetail({ commit }, params) {
      const res = await fetchDetailInfo(params)
      commit('SET_DETAIL', res)
      return res
    },
  },
}
```

---

# 4. Hooks 구조

---

## 4.1 useBasicInfo

> 역할: SSR → CSR fallback + UI 데이터 가공

```js
export const useBasicInfo = () => {
  const store = useStore()

  const basicInfo = computed(
    () => store.state.basicInfo.data
  )

  const detailInfo = computed(
    () => store.state.detailInfo.detail
  )

  const info = computed(() => {
    return detailInfo.value || basicInfo.value
  })

  const contents = computed(() => {
    const data = info.value || {}

    return {
      title: data.title,
      tags: data.tags || [],
      priceText: data.price
        ? `${data.price.toLocaleString()}원`
        : '',
    }
  })

  return {
    info,
    contents,
  }
}
```

---

## 4.2 useDetailInfo

> 역할: API 호출 + 상태 동기화

```js
export const useDetailInfo = (productCode) => {
  const store = useStore()

  const mapPriceInfo = (priceInfo) => ({
    adult: priceInfo?.A?.amount || 0,
    child: priceInfo?.C?.amount || 0,
    infant: priceInfo?.I?.amount || 0,
  })

  const fetchDetail = async (params = {}) => {
    return await store.dispatch('detailInfo/fetchDetail', {
      productCode,
      ...params,
    })
  }

  const init = async () => {
    const res = await fetchDetail()

    store.commit(
      'selectedDateAndPersons/SET_PRICE',
      mapPriceInfo(res.priceInfo)
    )
  }

  const handleDateChange = async (departureDate) => {
    const prevPerson =
      store.state.selectedDateAndPersons.person

    const res = await fetchDetail({
      departureDate,
    })

    store.commit('selectedDateAndPersons/SET_INIT', {
      departureDate: res.departureDate,
      arrivalDate: res.arrivalDate,
      price: mapPriceInfo(res.priceInfo),
      person: prevPerson,
    })
  }

  return {
    init,
    handleDateChange,
  }
}
```

---

# 5. 컴포넌트 사용 패턴

---

## 5.1 InfoArea.vue

```vue
<script setup>
const { contents } = useBasicInfo()
</script>

<template>
  <h1>{{ contents.title }}</h1>
</template>
```

---

## 5.2 CalendarArea.vue

```vue
<script setup>
const { handleDateChange } = useDetailInfo()

const onClickDate = (item) => {
  handleDateChange(item.departureDate)
}
</script>
```

---

## 5.3 PriceArea.vue

```vue
<script setup>
const store = useStore()

const totalPrice = computed(() =>
  store.getters['selectedDateAndPersons/totalPrice']
)
</script>
```

---

# 6. 주요 동작 흐름

---

## 6.1 초기 진입

```text
SSR → basicInfo
↓
UI 렌더링
↓
onMounted → detail API
↓
UI 갱신
```

---

## 6.2 달력 클릭

```text
날짜 선택
↓
API 재호출
↓
selected 전체 갱신 (person 유지)
↓
UI 갱신
```

---

## 6.3 인원 변경

```text
person 변경
↓
getter 자동 계산
↓
UI 반영
```

---

# 7. 핵심 포인트 요약

---

## ✔ 가장 중요한 3가지

1. **fallback 패턴**

   ```js
   detailInfo || basicInfo
   ```

2. **가격 계산은 getter**

   ```js
   totalPrice
   ```

3. **API 응답 → hook에서 변환**

   ```js
   A/C/I → adult/child/infant
   ```

---

## ✔ 구조 한 줄 요약

```text
SSR → 기본 렌더 → CSR 덮어쓰기 → 사용자 상태 유지 → getter 계산
```

---

# 8. 결론

이 구조는 다음을 모두 만족한다:

* SSR 빠른 초기 렌더링
* CSR 정확한 데이터
* 상태 관리 분리
* 유지보수 용이성
* 확장성 (프로모션, 좌석, 옵션 등)

---

👉 실무에서 바로 사용 가능한 패턴
