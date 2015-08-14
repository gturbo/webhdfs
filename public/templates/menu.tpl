<!-- DONT USE ' QUOTES IN TEMPLATES !!! -->

<script type="text/html" id="tplFile">
<div class="file">
	<span class="oi" data-glyph="document">&nbsp;&nbsp;<%=pathSuffix%> <%=length%></span>
	<span class="oi red" data-glyph="delete" title="delete file" fileName="<%=pathSuffix%>"/>
</div>
</script>
<script type="text/html" id="tplLocFile">
<div class="file blue">
	<span class="oi" data-glyph="document">&nbsp;&nbsp;<%=name%></span>
</div>
</script>

<script type="text/html" id="tplFolder">
<div class="folder">
	<span class="oi" data-glyph="plus">&nbsp;&nbsp;<%=pathSuffix%></span>
	<span class="oi red" data-glyph="delete" title="delete directory recursively" dirName="<%=pathSuffix%>"></span>
</div>
</script>

<script type="text/html" id="tplFolderNotExists">
<h1 class="red">ERREUR</h1>
<h3 class="red"><%=RemoteException && RemoteException.message%></h3>
<div class="send mkdir">CREER LE REPERTOIRE</div>
</script>
