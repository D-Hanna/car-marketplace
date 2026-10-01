package com.marketplace.carmarketplace.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.marketplace.carmarketplace.dto.CarCreateRequest;
import com.marketplace.carmarketplace.dto.CarResponse;
import com.marketplace.carmarketplace.exception.CarNotFoundException;
import com.marketplace.carmarketplace.exception.GlobalExceptionHandler;
import com.marketplace.carmarketplace.model.FuelType;
import com.marketplace.carmarketplace.service.CarService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(CarController.class)
@Import(GlobalExceptionHandler.class)
class CarControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private CarService carService;

    @Test
    @DisplayName("GET /api/v1/cars - Returns 200 OK and list of cars")
    void listCars_shouldReturnAllCars() throws Exception {
        UUID carId = UUID.randomUUID();
        CarResponse car = new CarResponse(
                carId,
                "Tesla",
                "Model 3",
                2023,
                15000,
                new BigDecimal("39999.00"),
                FuelType.ELECTRIC,
                "https://images.unsplash.com/test-image.jpg"
        );

        when(carService.findCars(null, null, null)).thenReturn(List.of(car));

        mockMvc.perform(get("/api/v1/cars")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].id", is(carId.toString())))
                .andExpect(jsonPath("$[0].make", is("Tesla")))
                .andExpect(jsonPath("$[0].model", is("Model 3")))
                .andExpect(jsonPath("$[0].year", is(2023)))
                .andExpect(jsonPath("$[0].mileage", is(15000)))
                .andExpect(jsonPath("$[0].price", is(39999.00)))
                .andExpect(jsonPath("$[0].fuelType", is("ELECTRIC")))
                .andExpect(jsonPath("$[0].imageUrl", is("https://images.unsplash.com/test-image.jpg")));

        verify(carService).findCars(null, null, null);
    }

    @Test
    @DisplayName("GET /api/v1/cars with filters - Passes parameters to service and returns 200 OK")
    void listCars_withFilters_shouldReturnFilteredCars() throws Exception {
        UUID carId = UUID.randomUUID();
        CarResponse car = new CarResponse(
                carId,
                "BMW",
                "330e",
                2022,
                25000,
                new BigDecimal("35000.00"),
                FuelType.PLUGIN_HYBRID,
                "https://images.unsplash.com/bmw.jpg"
        );

        when(carService.findCars(eq("BMW"), eq(new BigDecimal("40000.00")), eq(2020)))
                .thenReturn(List.of(car));

        mockMvc.perform(get("/api/v1/cars")
                        .param("make", "BMW")
                        .param("maxPrice", "40000.00")
                        .param("minYear", "2020")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].make", is("BMW")))
                .andExpect(jsonPath("$[0].model", is("330e")));

        verify(carService).findCars(eq("BMW"), eq(new BigDecimal("40000.00")), eq(2020));
    }

    @Test
    @DisplayName("GET /api/v1/cars/{id} - Returns 200 OK when car exists")
    void getCarById_whenFound_shouldReturnCar() throws Exception {
        UUID carId = UUID.randomUUID();
        CarResponse car = new CarResponse(
                carId,
                "Audi",
                "Q5",
                2021,
                35000,
                new BigDecimal("42000.00"),
                FuelType.DIESEL,
                "https://images.unsplash.com/audi.jpg"
        );

        when(carService.findCarById(carId)).thenReturn(car);

        mockMvc.perform(get("/api/v1/cars/{id}", carId)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id", is(carId.toString())))
                .andExpect(jsonPath("$.make", is("Audi")))
                .andExpect(jsonPath("$.model", is("Q5")))
                .andExpect(jsonPath("$.year", is(2021)))
                .andExpect(jsonPath("$.fuelType", is("DIESEL")));

        verify(carService).findCarById(carId);
    }

    @Test
    @DisplayName("GET /api/v1/cars/{id} - Returns 404 ProblemDetail when car not found")
    void getCarById_whenNotFound_shouldReturn404ProblemDetail() throws Exception {
        UUID carId = UUID.randomUUID();
        when(carService.findCarById(carId)).thenThrow(new CarNotFoundException(carId));

        mockMvc.perform(get("/api/v1/cars/{id}", carId)
                        .accept(MediaType.APPLICATION_JSON, MediaType.APPLICATION_PROBLEM_JSON))
                .andExpect(status().isNotFound())
                .andExpect(content().contentType(MediaType.APPLICATION_PROBLEM_JSON))
                .andExpect(jsonPath("$.status", is(404)))
                .andExpect(jsonPath("$.title", is("Not Found")))
                .andExpect(jsonPath("$.detail", containsString(carId.toString())))
                .andExpect(jsonPath("$.instance", is("/api/v1/cars/" + carId)));

        verify(carService).findCarById(carId);
    }

    @Test
    @DisplayName("GET /api/v1/cars/{id} - Returns 400 ProblemDetail when ID is not a valid UUID")
    void getCarById_whenInvalidUuid_shouldReturn400ProblemDetail() throws Exception {
        mockMvc.perform(get("/api/v1/cars/not-a-valid-uuid")
                        .accept(MediaType.APPLICATION_JSON, MediaType.APPLICATION_PROBLEM_JSON))
                .andExpect(status().isBadRequest())
                .andExpect(content().contentType(MediaType.APPLICATION_PROBLEM_JSON))
                .andExpect(jsonPath("$.status", is(400)))
                .andExpect(jsonPath("$.title", is("Bad Request")))
                .andExpect(jsonPath("$.detail", containsString("Invalid UUID format")));
    }

    @Test
    @DisplayName("POST /api/v1/cars - Returns 201 Created with Location header and car payload")
    void createCar_whenValidInput_shouldReturn201AndLocationHeader() throws Exception {
        UUID generatedId = UUID.randomUUID();
        CarCreateRequest request = new CarCreateRequest(
                "Porsche",
                "Taycan",
                2023,
                5000,
                new BigDecimal("89000.00"),
                FuelType.ELECTRIC,
                "https://images.unsplash.com/taycan.jpg"
        );

        CarResponse response = new CarResponse(
                generatedId,
                "Porsche",
                "Taycan",
                2023,
                5000,
                new BigDecimal("89000.00"),
                FuelType.ELECTRIC,
                "https://images.unsplash.com/taycan.jpg"
        );

        when(carService.createCar(any(CarCreateRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/cars")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request))
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isCreated())
                .andExpect(header().string("Location", "/api/v1/cars/" + generatedId))
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id", is(generatedId.toString())))
                .andExpect(jsonPath("$.make", is("Porsche")))
                .andExpect(jsonPath("$.model", is("Taycan")))
                .andExpect(jsonPath("$.year", is(2023)))
                .andExpect(jsonPath("$.mileage", is(5000)))
                .andExpect(jsonPath("$.price", is(89000.00)))
                .andExpect(jsonPath("$.fuelType", is("ELECTRIC")));

        verify(carService).createCar(any(CarCreateRequest.class));
    }

    @Test
    @DisplayName("POST /api/v1/cars - Returns 400 ProblemDetail with invalidParams when validation fails")
    void createCar_whenInvalidInput_shouldReturn400WithInvalidParams() throws Exception {
        // Invalid request: blank make, blank model, year too low, negative mileage, zero price, null fuelType, blank image
        CarCreateRequest invalidRequest = new CarCreateRequest(
                "",
                "   ",
                1899,
                -10,
                new BigDecimal("0.00"),
                null,
                ""
        );

        mockMvc.perform(post("/api/v1/cars")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest))
                        .accept(MediaType.APPLICATION_JSON, MediaType.APPLICATION_PROBLEM_JSON))
                .andExpect(status().isBadRequest())
                .andExpect(content().contentType(MediaType.APPLICATION_PROBLEM_JSON))
                .andExpect(jsonPath("$.status", is(400)))
                .andExpect(jsonPath("$.title", is("Bad Request")))
                .andExpect(jsonPath("$.detail", is("Validation failed for request body")))
                .andExpect(jsonPath("$.invalidParams", not(empty())))
                .andExpect(jsonPath("$.invalidParams[*].name", hasItems("make", "model", "year", "mileage", "price", "fuelType", "imageUrl")));
    }

    @Test
    @DisplayName("POST /api/v1/cars - Returns 400 ProblemDetail when JSON is malformed or fuelType invalid")
    void createCar_whenMalformedJson_shouldReturn400ProblemDetail() throws Exception {
        String malformedJson = """
                {
                    "make": "Tesla",
                    "model": "Model 3",
                    "year": 2023,
                    "mileage": 10000,
                    "price": 35000.00,
                    "fuelType": "NUCLEAR_POWERED",
                    "imageUrl": "https://example.com/car.jpg"
                }
                """;

        mockMvc.perform(post("/api/v1/cars")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(malformedJson)
                        .accept(MediaType.APPLICATION_JSON, MediaType.APPLICATION_PROBLEM_JSON))
                .andExpect(status().isBadRequest())
                .andExpect(content().contentType(MediaType.APPLICATION_PROBLEM_JSON))
                .andExpect(jsonPath("$.status", is(400)))
                .andExpect(jsonPath("$.title", is("Bad Request")));
    }
}
