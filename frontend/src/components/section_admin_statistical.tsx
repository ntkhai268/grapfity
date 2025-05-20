import React, { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Legend, LineChart, Line
} from "recharts";
import { fetchJoinedTracks, JoinedTrack } from "../services/trackService";

const formatDate = (dateStr: string): string => {
  const d = new Date(dateStr);
  return d.toISOString().slice(0, 10);
};

const StatsFullChart: React.FC = () => {
  const [tracks, setTracks] = useState<JoinedTrack[]>([]);
  const [filter, setFilter] = useState("All Time");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchJoinedTracks();
        setTracks(data);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error);
      }
    };
    fetchData();
  }, []);

  const filterByTime = (dateStr: string) => {
    const now = new Date();
    const createdAt = new Date(dateStr);
    if (filter === "Last 7 days") {
      const pastWeek = new Date();
      pastWeek.setDate(now.getDate() - 7);
      return createdAt >= pastWeek;
    }
    if (filter === "This Month") {
      return (
        createdAt.getMonth() === now.getMonth() &&
        createdAt.getFullYear() === now.getFullYear()
      );
    }
    return true;
  };

  // 📈 Biểu đồ đường (theo ngày)
  const dayMap = new Map<
    string,
    { uploadCount: number; songListenCount: number }
  >();
  tracks.forEach((track) => {
    if (filterByTime(track.createdAt)) {
      const date = formatDate(track.createdAt);
      const cur = dayMap.get(date) || { uploadCount: 0, songListenCount: 0 };
      cur.uploadCount += 1;
      dayMap.set(date, cur);
    }
    track.listeningHistories.forEach((hist) => {
      if (filterByTime(hist.createdAt)) {
        const date = formatDate(hist.createdAt);
        const cur = dayMap.get(date) || { uploadCount: 0, songListenCount: 0 };
        cur.songListenCount += hist.listenCount;
        dayMap.set(date, cur);
      }
    });
  });
  const lineData = Array.from(dayMap.entries())
    .map(([date, data]) => ({ date, ...data }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // 📊 Biểu đồ cột
  const listenStats = new Map<string, number>();
  const uploadStats = new Map<string, number>();
  const songStats = new Map<string, number>();

  tracks.forEach((track) => {
    // upload theo uploader
    if (filterByTime(track.createdAt)) {
      const uploader = track.User?.UploaderName ?? "Unknown";
      uploadStats.set(uploader, (uploadStats.get(uploader) || 0) + 1);
    }

    // lượt nghe bài hát
    const songName = track.Metadatum?.trackname || `Track ${track.id}`;
    let totalListen = 0;
    track.listeningHistories.forEach((hist) => {
      if (filterByTime(hist.createdAt)) {
        totalListen += hist.listenCount;
        const listener = hist.listener?.Name ?? "Unknown";
        listenStats.set(listener, (listenStats.get(listener) || 0) + hist.listenCount);
      }
    });
    if (totalListen > 0) {
      songStats.set(songName, (songStats.get(songName) || 0) + totalListen);
    }
  });

  const listenChartData = Array.from(listenStats, ([name, count]) => ({ name, count }));
  const uploadChartData = Array.from(uploadStats, ([name, count]) => ({ name, count }));
  const songChartData = Array.from(songStats, ([name, count]) => ({ name, count }));

  return (
    <div
      style={{
        background: "white",
        padding: "2rem",
        borderRadius: "1rem",
        minHeight: "100vh",
      }}
    >
      <h2 style={{ fontSize: "1.8rem", fontWeight: "bold", marginBottom: "1rem" }}>
        📊 System statistics
      </h2>

      {/* Bộ lọc */}
      <div style={{ marginBottom: "2rem" }}>
        <label style={{ marginRight: "1rem", fontWeight: 500 }}>Thời gian:</label>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{ padding: "0.5rem", fontSize: "1rem", borderRadius: "8px" }}
        >
          <option value="Last 7 days">Last 7 days</option>
          <option value="This Month">This month</option>
          <option value="All Time">All</option>
        </select>
      </div>

      {/* 📈 Biểu đồ đường */}
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={lineData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Legend verticalAlign="top" align="right" />
          <Line
            type="monotone"
            dataKey="uploadCount"
            name="🎤 Upload by User"
            stroke="#ff0000"
            strokeWidth={2}
            dot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="songListenCount"
            name="🎧 Listens by Song"
            stroke="#0000FF"
            strokeWidth={2}
            dot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* 📊 Biểu đồ cột */}
      <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap", justifyContent: "center", marginTop: "4rem" }}>
        {/* 🔥 Lượt nghe theo user */}
        <div style={{ width: "100%", maxWidth: 400 }}>
          <h3 style={{ textAlign: "center", fontWeight: "bold" }}>🔥 Listens by User</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={listenChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 🎤 Upload theo user */}
        <div style={{ width: "100%", maxWidth: 400 }}>
          <h3 style={{ textAlign: "center", fontWeight: "bold" }}>🎤 Upload by User</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={uploadChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 🎧 Lượt nghe theo bài hát */}
        <div style={{ width: "100%", maxWidth: 500 }}>
          <h3 style={{ textAlign: "center", fontWeight: "bold" }}>🎧 Listens by Song</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={songChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" interval={0} angle={-15} textAnchor="end" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#ffc658" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default StatsFullChart;
