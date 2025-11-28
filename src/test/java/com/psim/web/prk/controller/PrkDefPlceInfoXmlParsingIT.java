package com.psim.web.prk.controller;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.w3c.dom.Document;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.xpath.XPath;
import javax.xml.xpath.XPathFactory;
import java.io.ByteArrayInputStream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class PrkDefPlceInfoXmlParsingIT {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @WithMockUser
    @DisplayName("노상 폼 파라미터가 VO->XML로 정확히 변환된다")
    void insertOnstreet_shouldParseFormToXmlCorrectly() throws Exception {
        String xml = mockMvc.perform(post("/prk/debug/xml").with(csrf())
                        .param("prkPlceManageNo", "MG-ON-001")
                        .param("prkPlceInfoSn", "1")
                        .param("prkPlceType", "1")
                        .param("prkplceNm", "테스트 노상")
                        .param("dtadd", "서울 어딘가 1")
                        .param("prkPlceLat", "37.1")
                        .param("prkPlceLon", "127.1")
                        .param("totPrkCnt", "10")
                )
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        assertXmlField(xml, "prkPlceManageNo", "MG-ON-001");
        assertXmlField(xml, "prkPlceInfoSn", "1");
        assertXmlField(xml, "prkPlceType", "1");
        assertXmlField(xml, "prkplceNm", "테스트 노상");
        assertXmlField(xml, "dtadd", "서울 어딘가 1");
        assertXmlField(xml, "prkPlceLat", "37.1");
        assertXmlField(xml, "prkPlceLon", "127.1");
        assertXmlField(xml, "totPrkCnt", "10");
    }

    @Test
    @WithMockUser
    @DisplayName("노외 폼 파라미터가 VO->XML로 정확히 변환된다")
    void insertOffstreet_shouldParseFormToXmlCorrectly() throws Exception {
        String xml = mockMvc.perform(post("/prk/debug/xml").with(csrf())
                        .param("prkPlceManageNo", "MG-OFF-001")
                        .param("prkPlceInfoSn", "2")
                        .param("prkPlceType", "2")
                        .param("prkplceNm", "테스트 노외")
                        .param("dtadd", "서울 어딘가 2")
                        .param("prkPlceLat", "37.2")
                        .param("prkPlceLon", "127.2")
                        .param("totPrkCnt", "20")
                )
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        assertXmlField(xml, "prkPlceManageNo", "MG-OFF-001");
        assertXmlField(xml, "prkPlceInfoSn", "2");
        assertXmlField(xml, "prkPlceType", "2");
        assertXmlField(xml, "prkplceNm", "테스트 노외");
        assertXmlField(xml, "dtadd", "서울 어딘가 2");
        assertXmlField(xml, "prkPlceLat", "37.2");
        assertXmlField(xml, "prkPlceLon", "127.2");
        assertXmlField(xml, "totPrkCnt", "20");
    }

    @Test
    @WithMockUser
    @DisplayName("부설 폼 파라미터가 VO->XML로 정확히 변환된다")
    void insertBuild_shouldParseFormToXmlCorrectly() throws Exception {
        String xml = mockMvc.perform(post("/prk/debug/xml").with(csrf())
                        .param("prkPlceManageNo", "MG-BUILD-001")
                        .param("prkPlceInfoSn", "3")
                        .param("prkPlceType", "3")
                        .param("prkplceNm", "테스트 부설")
                        .param("dtadd", "서울 어딘가 3")
                        .param("prkPlceLat", "37.3")
                        .param("prkPlceLon", "127.3")
                        .param("totPrkCnt", "30")
                )
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        assertXmlField(xml, "prkPlceManageNo", "MG-BUILD-001");
        assertXmlField(xml, "prkPlceInfoSn", "3");
        assertXmlField(xml, "prkPlceType", "3");
        assertXmlField(xml, "prkplceNm", "테스트 부설");
        assertXmlField(xml, "dtadd", "서울 어딘가 3");
        assertXmlField(xml, "prkPlceLat", "37.3");
        assertXmlField(xml, "prkPlceLon", "127.3");
        assertXmlField(xml, "totPrkCnt", "30");
    }

    private Document parseXml(String xml) throws Exception {
        DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
        factory.setNamespaceAware(false);
        DocumentBuilder builder = factory.newDocumentBuilder();
        return builder.parse(new ByteArrayInputStream(xml.getBytes()));
    }

    private String getText(Document doc, String tag) throws Exception {
        XPath xPath = XPathFactory.newInstance().newXPath();
        return xPath.evaluate("//" + tag, doc);
    }

    private void assertXmlField(String xml, String tag, String expected) throws Exception {
        Document doc = parseXml(xml);
        String value = getText(doc, tag);
        assertThat(value).isEqualTo(expected);
    }
}
