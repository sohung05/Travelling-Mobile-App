package fit.se.travelling_app_be.controller;

import fit.se.travelling_app_be.dto.request.ProcessPaymentRequest;
import fit.se.travelling_app_be.dto.response.ApiResponse;
import fit.se.travelling_app_be.dto.response.ProcessPaymentResponse;
import fit.se.travelling_app_be.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PaymentController {
    
    private final PaymentService paymentService;
    
    @PostMapping("/process")
    public ResponseEntity<ApiResponse<ProcessPaymentResponse>> processPayment(
            @Valid @RequestBody ProcessPaymentRequest request) {
        try {
            ProcessPaymentResponse response = paymentService.processPayment(request);
            
            if (response.isSuccess()) {
                return ResponseEntity.ok(ApiResponse.success(
                    response.getMessage(),
                    response
                ));
            } else {
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error(response.getMessage()));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Failed to process payment: " + e.getMessage()));
        }
    }
}

