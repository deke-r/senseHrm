"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Tree, TreeNode } from "react-organizational-chart";
import Card from "@mui/material/Card";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

/* Helper: format image path */
const getImageUrl = (photoPath) => {
  if (!photoPath) return `${API_URL.replace("/api", "")}/uploads/profile/default.jpg`;
  if (photoPath.startsWith("http")) return photoPath;
  return `${API_URL.replace("/api", "")}${photoPath}`;
};

/* 🎨 Styled card for employee node */
const StyledCard = styled(Card)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: "12px 8px",
  minWidth: 160,
  borderRadius: 10,
  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  background: "#fff",
  transition: "0.3s",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 4px 10px rgba(0,0,0,0.12)"
  }
}));

/* 🧱 Single employee node */
function EmployeeNode({ emp }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <TreeNode
      label={
        <StyledCard>
          <Avatar
            src={getImageUrl(emp.photo_url)}
            alt={emp.name}
            sx={{
              width: 64,
              height: 64,
              mb: 1,
              border: "2px solid #0B76D1",
              objectFit: "cover"
            }}
          />
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {emp.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {emp.designation || "—"}
          </Typography>
          {emp.subordinates && emp.subordinates.length > 0 && (
            <IconButton
              size="small"
              onClick={() => setCollapsed(!collapsed)}
              sx={{
                mt: 1,
                transform: collapsed ? "rotate(180deg)" : "rotate(0)",
                transition: "0.2s"
              }}
            >
              <ExpandMoreIcon fontSize="small" />
            </IconButton>
          )}
        </StyledCard>
      }
    >
      {!collapsed &&
        emp.subordinates?.map((child) => (
          <EmployeeNode key={child.id} emp={child} />
        ))}
    </TreeNode>
  );
}

/* 🧩 Main hierarchy component */
export default function HierarchyTree() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchHierarchy();
  }, []);

  const fetchHierarchy = async () => {
    try {
      const res = await axios.get(`${API_URL}/hierarchy`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      setData(res.data[0]); // top-most CMD/root
    } catch (err) {
      console.error("❌ Error fetching hierarchy:", err);
    }
  };

  return (
    <>
      <Navbar />
      <Sidebar />
      <main
        style={{
          minHeight: "100vh",
          background: "#f9fafc",
          padding: "2rem 1rem",
          overflowX: "auto"
        }}
      >
        <Box textAlign="center" mb={3}>
          <Typography variant="h5" fontWeight={600}>
            Organization Hierarchy
          </Typography>
        </Box>

        {data ? (
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <Tree
              lineWidth={"2px"}
              lineColor={"#bbc"}
              lineBorderRadius={"12px"}
              label={
                <StyledCard>
                  <Avatar
                    src={getImageUrl(data.photo_url)}
                    alt={data.name}
                    sx={{
                      width: 72,
                      height: 72,
                      mb: 1,
                      border: "2px solid #0B76D1",
                      objectFit: "cover"
                    }}
                  />
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {data.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {data.designation || "—"}
                  </Typography>
                </StyledCard>
              }
            >
              {data.subordinates?.map((emp) => (
                <EmployeeNode key={emp.id} emp={emp} />
              ))}
            </Tree>
          </Box>
        ) : (
          <Typography textAlign="center" color="text.secondary">
            Loading hierarchy...
          </Typography>
        )}
      </main>
    </>
  );
}
