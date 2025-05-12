import React, { useState, useRef, useEffect } from 'react';
// import './SongOptionOfUser.css'; 

interface SongOptionOfUserProps {
  onEdit: () => void;
  onDelete: () => void;
}

const SongOptionOfUser: React.FC<SongOptionOfUserProps> = ({ onEdit, onDelete }) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="more_options_container" ref={dropdownRef}>
      <div className="more_options_icon" onClick={() => setOpen(!open)}><i className="fas fa-ellipsis-h" style={{ color: "white" }}></i></div>
      {open && (
        <div className="dropdown_menu">
          <div className="dropdown_item" onClick={onEdit}>Chỉnh sửa nhạc</div>
          <div className="dropdown_item" onClick={onDelete}>Xoá nhạc</div>
        </div>
      )}
    </div>
  );
};

export default SongOptionOfUser;
