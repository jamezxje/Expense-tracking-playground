package com.example.finance.controller;

import com.example.finance.entity.Transaction;
import com.example.finance.service.TransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final TransactionService transactionService;

    @GetMapping("/summary")
    public Map<String, Object> getSummary(@RequestParam(defaultValue = "all") String period) {
        List<Transaction> allTransactions = transactionService.getAllTransactions();
        
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startDate = switch (period.toLowerCase()) {
            case "week" -> now.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY)).withHour(0).withMinute(0).withSecond(0).withNano(0);
            case "month" -> now.with(TemporalAdjusters.firstDayOfMonth()).withHour(0).withMinute(0).withSecond(0).withNano(0);
            case "year" -> now.with(TemporalAdjusters.firstDayOfYear()).withHour(0).withMinute(0).withSecond(0).withNano(0);
            default -> LocalDateTime.of(1900, 1, 1, 0, 0);
        };

        List<Transaction> transactions = allTransactions.stream()
                .filter(t -> t.getTransactionDate().isAfter(startDate) || t.getTransactionDate().isEqual(startDate))
                .collect(Collectors.toList());
        
        BigDecimal totalIncome = transactions.stream()
                .filter(t -> t.getAmount().compareTo(BigDecimal.ZERO) > 0)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalExpense = transactions.stream()
                .filter(t -> t.getAmount().compareTo(BigDecimal.ZERO) < 0)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add).abs();

        BigDecimal balance = totalIncome.subtract(totalExpense);

        Map<String, BigDecimal> categorySpending = transactions.stream()
                .filter(t -> t.getAmount().compareTo(BigDecimal.ZERO) < 0)
                .collect(Collectors.groupingBy(
                        Transaction::getCategory,
                        Collectors.reducing(BigDecimal.ZERO, t -> t.getAmount().abs(), BigDecimal::add)
                ));

        Map<String, Object> response = new HashMap<>();
        response.put("totalIncome", totalIncome);
        response.put("totalExpense", totalExpense);
        response.put("balance", balance);
        response.put("categorySpending", categorySpending);
        
        return response;
    }
}
