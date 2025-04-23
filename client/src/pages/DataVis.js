import axios from 'axios';
import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Grid, Typography, Box, Card, CardContent } from '@mui/material';
import { useSettings } from '../context/SettingsContext';
import useMediaQuery from '@mui/material/useMediaQuery';

const DataVis = () => {
    const [data, setData] = useState([]);
    const [error, setError] = useState(null);
    const barChartRef = useRef();
    const pieChartRef = useRef();
    const lowStockChartRef = useRef();
    const { lowStockThreshold } = useSettings();
    const isMobile = useMediaQuery('(max-width:600px)'); // Detect mobile screens

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('/api/products/');
                setData(response.data.data);
            } catch (err) {
                setError('Failed to fetch data.');
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (data.length > 0) {
            createPieChart();
            createBarChart();
            createLowStockChart();
        }
    }, [data]);

    const createBarChart = () => {
        const svg = d3.select(barChartRef.current);
        svg.selectAll('*').remove(); // Clear previous chart

        // Adjust dimensions for mobile
        const margin = { top: 30, right: 30, bottom: 70, left: 60 },
            width = (isMobile ? 300 : 460) - margin.left - margin.right,
            height = (isMobile ? 300 : 400) - margin.top - margin.bottom;

        // Append the svg object
        const chart = svg
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // Calculate aggregated data
        const totalCategories = new Set(data.map(d => d.category)).size;
        const totalQuantity = data.reduce((sum, item) => sum + item.quantity, 0);
        const totalPrice = data.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const totalUniqueItems = data.length;

        const aggregatedData = [
            { label: "Categories", value: totalCategories },
            { label: "Unique Items", value: totalUniqueItems }
        ];

        // X axis
        const x = d3.scaleBand()
            .range([0, width])
            .domain(aggregatedData.map(d => d.label))
            .padding(0.2);

        chart.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x))
            .selectAll("text")
            .attr("transform", "translate(-10,0)rotate(-45)")
            .style("text-anchor", "end");

        // Y axis
        const y = d3.scaleLinear()
            .domain([0, d3.max(aggregatedData, d => d.value)])
            .range([height, 0]);

        chart.append("g")
            .call(d3.axisLeft(y));

        // Tooltip
        const tooltip = d3.select(barChartRef.current.parentNode)
            .append("div")
            .style("position", "absolute")
            .style("background", "white")
            .style("border", "1px solid #ccc")
            .style("padding", "5px")
            .style("border-radius", "5px")
            .style("opacity", 0)
            .style("pointer-events", "none");

        // Bars
        chart.selectAll("bars")
            .data(aggregatedData)
            .enter()
            .append("rect")
            .attr("x", d => x(d.label))
            .attr("y", d => y(d.value))
            .attr("width", x.bandwidth())
            .attr("height", d => height - y(d.value))
            .attr("fill", "#69b3a2")
            .on("mouseover", (event, d) => {
                tooltip
                    .style("opacity", 1)
                    .html(`Value: ${d.value}`)
                    .style("left", `${event.pageX + 10}px`)
                    .style("top", `${event.pageY - 20}px`);
            })
            .on("mousemove", event => {
                tooltip
                    .style("left", `${event.pageX + 10}px`)
                    .style("top", `${event.pageY - 20}px`);
            })
            .on("mouseout", () => {
                tooltip.style("opacity", 0);
            });
    };

    const createPieChart = () => {
        const svg = d3.select(pieChartRef.current);
        svg.selectAll('*').remove(); // Clear previous chart

        // Adjust dimensions for mobile
        const width = isMobile ? 300 : 400;
        const height = isMobile ? 300 : 400;
        const radius = Math.min(width, height) / 2;

        svg
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", [-width / 2, -height / 2, width, height])
            .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif;");

        const categoryCounts = d3.rollup(
            data,
            v => v.length,
            d => d.category
        );

        const total = Array.from(categoryCounts.values()).reduce((acc, count) => acc + count, 0);

        const pie = d3.pie()
            .sort(null)
            .value(d => d[1]); // Use the correct value from categoryCounts

        const arc = d3.arc()
            .innerRadius(0)
            .outerRadius(Math.min(width, height) / 2 - 1);

        const labelRadius = arc.outerRadius()() * 0.8;

        const arcLabel = d3.arc()
            .innerRadius(labelRadius)
            .outerRadius(labelRadius);

        const arcs = pie(Array.from(categoryCounts)); // Convert categoryCounts to an array

        const color = d3.scaleOrdinal()
            .domain(Array.from(categoryCounts.keys())) // Use category names as the domain
            .range(d3.quantize(t => d3.interpolateSpectral(t * 0.8 + 0.1), data.length).reverse());

        // Tooltip
        const tooltip = d3.select(pieChartRef.current.parentNode)
            .append("div")
            .style("position", "absolute")
            .style("background", "white")
            .style("border", "1px solid #ccc")
            .style("padding", "5px")
            .style("border-radius", "5px")
            .style("opacity", 0)
            .style("pointer-events", "none");

        // Add a sector path for each value.
        svg.append("g")
            .attr("stroke", "white")
            .selectAll()
            .data(arcs)
            .join("path")
            .attr("fill", d => color(d.data[0]))
            .attr("d", arc)
            .on("mouseover", (event, d) => {
                const percentage = ((d.data[1] / total) * 100).toFixed(2);
                tooltip
                    .style("opacity", 1)
                    .html(`${d.data[0]}: ${percentage}%`)
                    .style("left", `${event.pageX + 10}px`)
                    .style("top", `${event.pageY - 20}px`);
            })
            .on("mousemove", event => {
                tooltip
                    .style("left", `${event.pageX + 10}px`)
                    .style("top", `${event.pageY - 20}px`);
            })
            .on("mouseout", () => {
                tooltip.style("opacity", 0);
            });

        // Create a new arc generator to place a label close to the edge.
        svg.append("g")
            .attr("text-anchor", "middle")
            .selectAll()
            .data(arcs)
            .join("text")
            .attr("transform", d => `translate(${arcLabel.centroid(d)})`)
            .call(text => text.append("tspan")
                .attr("y", "-0.4em")
                .attr("font-weight", "bold")
                .text(d => d.data[0]))
            .call(text => text.filter(d => (d.endAngle - d.startAngle) > 0.25).append("tspan")
                .attr("x", 0)
                .attr("y", "0.7em")
                .attr("fill-opacity", 0.7)
                .text(d => `${((d.data[1] / total) * 100).toFixed(2)}%`));
    };

    const createLowStockChart = () => {
        const svg = d3.select(lowStockChartRef.current);
        svg.selectAll('*').remove(); // Clear previous chart

        // Adjust dimensions for mobile
        const margin = { top: 30, right: 30, bottom: 70, left: 60 },
            width = (isMobile ? 300 : 460) - margin.left - margin.right,
            height = (isMobile ? 300 : 400) - margin.top - margin.bottom;

        // Append the svg object
        const chart = svg
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // Filter low stock items
        const lowStockItems = data.filter(item => item.quantity <= lowStockThreshold);

        // X axis
        const x = d3.scaleBand()
            .range([0, width])
            .domain(lowStockItems.map(d => d.name))
            .padding(0.2);

        chart.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x))
            .selectAll("text")
            .attr("transform", "translate(-10,0)rotate(-45)")
            .style("text-anchor", "end");

        // Y axis
        const y = d3.scaleLinear()
            .domain([0, d3.max(lowStockItems, d => d.quantity)])
            .range([height, 0]);

        chart.append("g")
            .call(d3.axisLeft(y));

        // Tooltip
        const tooltip = d3.select(lowStockChartRef.current.parentNode)
            .append("div")
            .style("position", "absolute")
            .style("background", "white")
            .style("border", "1px solid #ccc")
            .style("padding", "5px")
            .style("border-radius", "5px")
            .style("opacity", 0)
            .style("pointer-events", "none");

        // Bars
        chart.selectAll("bars")
            .data(lowStockItems)
            .enter()
            .append("rect")
            .attr("x", d => x(d.name))
            .attr("y", d => y(d.quantity))
            .attr("width", x.bandwidth())
            .attr("height", d => height - y(d.quantity))
            .attr("fill", "red")
            .on("mouseover", (event, d) => {
                tooltip
                    .style("opacity", 1)
                    .html(`Item: ${d.name}<br>Quantity: ${d.quantity}`)
                    .style("left", `${event.pageX + 10}px`)
                    .style("top", `${event.pageY - 20}px`);
            })
            .on("mousemove", event => {
                tooltip
                    .style("left", `${event.pageX + 10}px`)
                    .style("top", `${event.pageY - 20}px`);
            })
            .on("mouseout", () => {
                tooltip.style("opacity", 0);
            });
    };

    if (error) return <p>{error}</p>;

    return (
        <Box sx={{ p: isMobile ? 2 : 3 }}>
            <Typography variant="h4" gutterBottom align="center">
                Data Visualization using D3.js
            </Typography>
            <Grid container spacing={isMobile ? 2 : 3} justifyContent="center">
                <Grid item xs={12} sm={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom align="center">
                                Overall Summary
                            </Typography>
                            <svg ref={barChartRef} style={{ width: "100%", height: "auto" }}></svg>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom align="center">
                                Product Categories
                            </Typography>
                            <svg ref={pieChartRef} style={{ width: "100%", height: "auto" }}></svg>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom align="center">
                                Low Stock Items
                            </Typography>
                            <svg ref={lowStockChartRef} style={{ width: "100%", height: "auto" }}></svg>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default DataVis;