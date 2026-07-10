import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from "@mui/material";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import ModelTrainingIcon from "@mui/icons-material/ModelTraining";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import { ResponsiveContainer, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip as ChartTooltip, Area } from "recharts";
import toast from "react-hot-toast";

import { getPredictionHistory, trainModel, getTomorrowPrediction } from "../../api/aiApi";

function AI() {
  const [history, setHistory] = useState([]);
  const [tomorrowPrediction, setTomorrowPrediction] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [training, setTraining] = useState(false);
  const [predicting, setPredicting] = useState(false);

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const loadData = async () => {
    setLoading(true);
    try {
      const histRes = await getPredictionHistory();
      setHistory(histRes.data.data || []);
      
      // Auto predict tomorrow if it exists or trigger it
      const predRes = await getTomorrowPrediction();
      setTomorrowPrediction(predRes.data.data.prediction || null);
      setRecommendations(predRes.data.data.recommendations || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load AI predictions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTrain = async () => {
    setTraining(true);
    const toastId = toast.loading("Training ML Model on consumption dataset...");
    try {
      await trainModel();
      toast.success("AI model trained successfully", { id: toastId });
      loadData();
    } catch (error) {
      console.error(error);
      toast.error("Training failed: " + (error.response?.data?.message || error.message), { id: toastId });
    } finally {
      setTraining(false);
    }
  };

  const handlePredict = async () => {
    setPredicting(true);
    try {
      const res = await getTomorrowPrediction();
      setTomorrowPrediction(res.data.data.prediction);
      setRecommendations(res.data.data.recommendations);
      toast.success("Tomorrow's food requirements predicted!");
      loadData();
    } catch (error) {
      console.error(error);
      toast.error("Prediction failed");
    } finally {
      setPredicting(false);
    }
  };

  // Recharts formatted data
  const chartData = [...history]
    .reverse()
    .slice(-15) // last 15 days
    .map((item) => ({
      date: new Date(item.prediction_date).toLocaleDateString(undefined, { day: "numeric", month: "short" }),
      Breakfast: item.expected_breakfast,
      Lunch: item.expected_lunch,
      Dinner: item.expected_dinner,
    }));

  const paginatedHistory = history.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={{ xs: 2, sm: 3, md: 4 }}>
      <Box
        display="flex"
        flexDirection={{ xs: "column", md: "row" }}
        gap={2}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", md: "center" }}
        mb={4}
      >
        <Box display="flex" alignItems="center">
          <SmartToyIcon color="primary" sx={{ fontSize: { xs: 32, sm: 40 }, mr: 2 }} />
          <Typography variant="h4" fontWeight="bold" sx={{ fontSize: { xs: "1.5rem", sm: "2.125rem" } }}>
            AI Food Prediction Center
          </Typography>
        </Box>
        <Box display="flex" flexDirection={{ xs: "column", sm: "row" }} gap={2} width={{ xs: "100%", md: "auto" }}>
          <Button
            variant="outlined"
            startIcon={<ModelTrainingIcon />}
            onClick={handleTrain}
            disabled={training}
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            {training ? "Training..." : "Train Model"}
          </Button>
          <Button
            variant="contained"
            startIcon={<PlayArrowIcon />}
            onClick={handlePredict}
            disabled={predicting}
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            {predicting ? "Predicting..." : "Predict Tomorrow"}
          </Button>
        </Box>
      </Box>

      <Grid container spacing={4} mb={4}>
        {/* Prediction Cards */}
        <Grid item xs={12} md={7}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 3, minHeight: 280 }}>
            <Typography variant="h6" fontWeight="bold" mb={2}>
              Tomorrow's Predicted Servings Requirement
            </Typography>
            <Divider sx={{ mb: 3 }} />
            {tomorrowPrediction ? (
              <Grid container spacing={2} textAlign="center">
                <Grid item xs={4}>
                  <Box sx={{ p: 2, bgcolor: "#e3f2fd", borderRadius: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Breakfast
                    </Typography>
                    <Typography variant="h3" fontWeight="bold" color="primary.main">
                      {tomorrowPrediction.breakfast_prediction ?? tomorrowPrediction.breakfast}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      servings
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box sx={{ p: 2, bgcolor: "#e8f5e9", borderRadius: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Lunch
                    </Typography>
                    <Typography variant="h3" fontWeight="bold" color="success.main">
                      {tomorrowPrediction.lunch_prediction ?? tomorrowPrediction.lunch}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      servings
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box sx={{ p: 2, bgcolor: "#fff3e0", borderRadius: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Dinner
                    </Typography>
                    <Typography variant="h3" fontWeight="bold" color="warning.main">
                      {tomorrowPrediction.dinner_prediction ?? tomorrowPrediction.dinner}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      servings
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            ) : (
              <Typography color="text.secondary" align="center" py={5}>
                Click "Predict Tomorrow" to generate prediction values.
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Recommendations */}
        <Grid item xs={12} md={5}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 3, minHeight: 280 }}>
            <Box display="flex" alignItems="center" mb={2}>
              <LightbulbIcon color="warning" sx={{ mr: 1 }} />
              <Typography variant="h6" fontWeight="bold">
                Smart Suggestions
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            {recommendations.length > 0 ? (
              <Box display="flex" flexDirection="column" gap={1.5}>
                {recommendations.map((rec, idx) => (
                  <Box
                    key={idx}
                    sx={{ p: 1.5, borderLeft: "4px solid #1976d2", bgcolor: "#f5f5f5", borderRadius: "0 4px 4px 0" }}
                  >
                    <Typography variant="body2">{rec}</Typography>
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography color="text.secondary" py={4}>
                No AI recommendations available yet. Set PG settings and run predictions to start receiving recommendations.
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Chart */}
      {chartData.length > 0 && (
        <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight="bold" mb={3}>
            servings demand forecast trends
          </Typography>
          <Box sx={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorBf" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1976d2" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#1976d2" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorLn" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2e7d32" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#2e7d32" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <ChartTooltip />
                <Area type="monotone" dataKey="Breakfast" stroke="#1976d2" fillOpacity={1} fill="url(#colorBf)" />
                <Area type="monotone" dataKey="Lunch" stroke="#2e7d32" fillOpacity={1} fill="url(#colorLn)" />
              </AreaChart>
            </ResponsiveContainer>
          </Box>
        </Paper>
      )}

      {/* Prediction History Table */}
      <Paper elevation={3} sx={{ borderRadius: 2, overflow: "hidden" }}>
        <Typography variant="h6" fontWeight="bold" sx={{ p: 3, bgcolor: "#fafafa" }}>
          AI Predictions Logs
        </Typography>
        <TableContainer sx={{ overflowX: "auto" }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><b>Date</b></TableCell>
                <TableCell align="center"><b>Expected Breakfast</b></TableCell>
                <TableCell align="center"><b>Expected Lunch</b></TableCell>
                <TableCell align="center"><b>Expected Dinner</b></TableCell>
                <TableCell align="center"><b>Model Accuracy</b></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedHistory.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                    No predictions found in history logs.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedHistory.map((item) => (
                  <TableRow key={item.prediction_id} hover>
                    <TableCell><b>{new Date(item.prediction_date).toLocaleDateString()}</b></TableCell>
                    <TableCell align="center">{item.expected_breakfast} servings</TableCell>
                    <TableCell align="center">{item.expected_lunch} servings</TableCell>
                    <TableCell align="center">{item.expected_dinner} servings</TableCell>
                    <TableCell align="center">
                      {item.accuracy !== null ? `${(item.accuracy * 100).toFixed(1)}%` : "N/A"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={history.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </Paper>
    </Box>
  );
}

export default AI;