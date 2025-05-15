interface RepeatButtonProps {
  mode: 'off' | 'one' | 'all';
  onToggle: () => void;
}
interface ShuffleButtonProps {
  isActive: boolean;
  onToggle: () => void;
}

const RepeatButton: React.FC<RepeatButtonProps> = ({ mode, onToggle }) => {
  const getColor = () => {
    if (mode === 'one') return '#2ecc71';     // vàng
    if (mode === 'all') return '#2ecc71';     // xanh lá
    return '#999999';                         // xám nhạt
  };

  const commonSvgProps = {
    viewBox: "0 0 16 16",
    fill: getColor(),
    width: 15,
    height: 15,
  };

  return (
    <button onClick={onToggle} title={`Repeat: ${mode}`}>
      {mode === 'one' ? (
        <svg {...commonSvgProps}>
          <path d="M0 4.75A3.75 3.75 0 0 1 3.75 1h.75v1.5h-.75A2.25 2.25 0 0 0 1.5 4.75v5A2.25 2.25 0 0 0 3.75 12H5v1.5H3.75A3.75 3.75 0 0 1 0 9.75v-5ZM12.25 2.5a2.25 2.25 0 0 1 2.25 2.25v5A2.25 2.25 0 0 1 12.25 12H9.81l1.018-1.018a.75.75 0 0 0-1.06-1.06L6.939 12.75l2.829 2.828a.75.75 0 1 0 1.06-1.06L9.811 13.5h2.439A3.75 3.75 0 0 0 16 9.75v-5A3.75 3.75 0 0 0 12.25 1h-.75v1.5h.75Z"></path>
          <path d="m8 1.85.77.694H6.095V1.488c.697-.051 1.2-.18 1.507-.385.316-.205.51-.51.583-.913h1.32V8H8V1.85Z"></path>
          <path d="M8.77 2.544 8 1.85v.693h.77Z"></path>
        </svg>
      ) : (
        <svg {...commonSvgProps}>
          <path d="M0 4.75A3.75 3.75 0 0 1 3.75 1h8.5A3.75 3.75 0 0 1 16 4.75v5a3.75 3.75 0 0 1-3.75 3.75H9.81l1.018 1.018a.75.75 0 1 1-1.06 1.06L6.939 12.75l2.829-2.828a.75.75 0 1 1 1.06 1.06L9.811 12h2.439a2.25 2.25 0 0 0 2.25-2.25v-5a2.25 2.25 0 0 0-2.25-2.25h-8.5A2.25 2.25 0 0 0 1.5 4.75v5A2.25 2.25 0 0 0 3.75 12H5v1.5H3.75A3.75 3.75 0 0 1 0 9.75v-5z"></path>
        </svg>
      )}
    </button>
  );
};
const ShuffleButton: React.FC<ShuffleButtonProps> = ({ isActive, onToggle }) => {
  const color = isActive ? '#2ecc71' : '#999';

  return (
    <button onClick={onToggle} title={`Shuffle: ${isActive ? 'Bật' : 'Tắt'}`}>
      <svg viewBox="0 0 16 16" fill={color} width={15} height={15}>
        <path d="M13.151.922a.75.75 0 1 0-1.06 1.06L13.109 3H11.16a3.75 3.75 0 0 0-2.873 1.34l-6.173 7.356A2.25 2.25 0 0 1 .39 12.5H0V14h.391a3.75 3.75 0 0 0 2.873-1.34l6.173-7.356a2.25 2.25 0 0 1 1.724-.804h1.947l-1.017 1.018a.75.75 0 0 0 1.06 1.06L15.98 3.75 13.15.922zM.391 3.5H0V2h.391c1.109 0 2.16.49 2.873 1.34L4.89 5.277l-.979 1.167-1.796-2.14A2.25 2.25 0 0 0 .39 3.5z"></path>
        <path d="m7.5 10.723.98-1.167.957 1.14a2.25 2.25 0 0 0 1.724.804h1.947l-1.017-1.018a.75.75 0 1 1 1.06-1.06l2.829 2.828-2.829 2.828a.75.75 0 1 1-1.06-1.06L13.109 13H11.16a3.75 3.75 0 0 1-2.873-1.34l-.787-.938z"></path>
      </svg>
    </button>
  );
};

export { RepeatButton, ShuffleButton };


