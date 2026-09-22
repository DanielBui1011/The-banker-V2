import ScreenShell from '../components/ScreenShell.jsx'

// Không phải điểm dừng riêng trong chuỗi mũi tên trái/phải — đây là diễn biến thay thế
// của Màn 6 khi bật kịch bản rò rỉ (phím L). Giữ file riêng để sau này Màn 6 điều hướng tới
// khi trạng thái kịch bản "rò rỉ" được bật.
export default function Screen9() {
  return <ScreenShell screenNumber={9} title="Kịch bản rò rỉ" />
}
