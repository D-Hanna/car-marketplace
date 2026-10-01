package com.marketplace.carmarketplace;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.marketplace.carmarketplace.dto.CarCreateRequest;
import com.marketplace.carmarketplace.model.FuelType;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class CarIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("Integration: GET /api/v1/cars returns seeded cars")
    void shouldReturnSeededCars() throws Exception {
        mockMvc.perform(get("/api/v1/cars")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(8))))
                .andExpect(jsonPath("$[*].make", hasItems("Tesla", "BMW", "Audi", "Toyota", "Porsche", "Mercedes-Benz")));
    }

    @Test
    @DisplayName("Integration: Filter by make=Tesla")
    void shouldFilterByMake() throws Exception {
        mockMvc.perform(get("/api/v1/cars")
                        .param("make", "Tesla")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", not(empty())))
                .andExpect(jsonPath("$[0].make", is("Tesla")));
    }

    @Test
    @DisplayName("Integration: Filter by maxPrice and minYear")
    void shouldFilterByPriceAndYear() throws Exception {
        mockMvc.perform(get("/api/v1/cars")
                        .param("maxPrice", "35000.00")
                        .param("minYear", "2021")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", not(empty())))
                .andExpect(jsonPath("$[*].price", everyItem(lessThanOrEqualTo(35000.0))))
                .andExpect(jsonPath("$[*].year", everyItem(greaterThanOrEqualTo(2021))));
    }

    @Test
    @DisplayName("Integration: Full create and fetch cycle")
    void shouldCreateAndRetrieveCar() throws Exception {
        CarCreateRequest newCar = new CarCreateRequest(
                "Hyundai",
                "Ioniq 5",
                2024,
                3200,
                new BigDecimal("43500.00"),
                FuelType.ELECTRIC,
                "https://images.unsplash.com/photo-ioniq.jpg"
        );

        String createResponse = mockMvc.perform(post("/api/v1/cars")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(newCar))
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isCreated())
                .andExpect(header().exists("Location"))
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.make", is("Hyundai")))
                .andExpect(jsonPath("$.model", is("Ioniq 5")))
                .andReturn()
                .getResponse()
                .getContentAsString();

        String carId = objectMapper.readTree(createResponse).get("id").asText();

        mockMvc.perform(get("/api/v1/cars/" + carId)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(carId)))
                .andExpect(jsonPath("$.make", is("Hyundai")))
                .andExpect(jsonPath("$.model", is("Ioniq 5")));
    }
}
