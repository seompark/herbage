const timeText = time => {
  const hours = new Date(time).getHours()
  let text
  if (hours < 6) text = '새벽'
  else if (hours < 11) text = '아침'
  else if (hours < 14) text = '점심'
  else if (hours < 15) text = '오후'
  else if (hours < 20) text = '저녁'
  else if (hours < 24) text = '밤'
  return text
}

export default timeText
